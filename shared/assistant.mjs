// Extractive retrieval only. It never writes factual statements or combines figures.
const STOP_WORDS = new Set(`a as o os um uma uns umas de da das do dos em no nos na nas por para com sem sobre entre ate e ou mas que qual quais quem como quando quanto quantos quanta quantas onde porque por que foi foram era eram ser estar esta estao e isso isto esse essa esses essas seu sua seus suas se ao aos ja ha houve tem tenho temos teria tinha tiveram pode podem poderia quero queria gostaria saber me explique explica explicar mostre mostrar traga trazer diga diz dizer fale fala falar conte conta voce voces cara gente documento documentos doc docs pagina paginas estudo estudos analise analises projeto segundo sabe sabemos informacao informacoes dizem disse mudou mudanca mudancas evoluiu evolucao comprova comprovou causou mais menos muito pouco tambem entao aqui ali la agora favor ocorre ocorreu ocorrer feito fez fazer acontece aconteceu brasileira brasileiro brasileiros brasileiras brasil resultado resultados impacto impactos efeito efeitos governo governos presidente presidentes comparacao comparar compare funciona funcionar`.split(/\s+/));
const RELATED = [
  ['desemprego', 'desocupacao'], ['juros', 'juro', 'selic'],
  ['divida', 'endividamento', 'dbgg'], ['tributacao', 'tributo', 'imposto', 'impostos'],
  ['aposentadoria', 'aposentado', 'aposentados', 'previdencia'],
  ['salario', 'rendimento', 'remuneracao'], ['privatizacao', 'desestatizacao'],
  ['inflacao', 'ipca'], ['esgoto', 'saneamento'], ['jornada', '6x1'],
];
const ACTORS = ['lula', 'bolsonaro', 'temer', 'dilma', 'fhc', 'milei'];
const ENTITIES = [...ACTORS, 'eletrobras', 'gol', 'inss', 'bndes', 'argentina', 'qav', 'ideb', 'pisa', 'caged', 'stf'];
export const normalize = text => String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\blula([123])\b/g, 'lula $1');
const words = text => normalize(text).match(/[a-z0-9]+/g) || [];
const stem = word => word.length > 5 ? word.replace(/(?:coes|cao)$/, 'c').replace(/s$/, '') : word;
const tokenSet = text => new Set(words(text).map(stem));
export const questionTerms = question => [...new Set(words(question).filter(word => !STOP_WORDS.has(word) && (word.length >= 3 || /^\d{4}$/.test(word))))].slice(0, 24);
const hasWord = (text, word) => words(text).includes(word);
const groupsFor = term => RELATED.find(group => group.some(word => stem(word) === stem(term))) || [term];

export function prepareQuestion(question, previousQuestion = '') {
  const own = questionTerms(question);
  const entities = ENTITIES.filter(entity => hasWord(question, entity));
  const followup = /^\s*(e\b|quanto a\b)/.test(normalize(question)) && previousQuestion;
  const inherited = followup ? questionTerms(previousQuestion).filter(term => !ENTITIES.includes(term) && !/^\d+$/.test(term)) : [];
  const terms = [...new Set([...own, ...inherited])].slice(0, 24);
  return { terms, entities, contextUsed: !!followup && inherited.length > 0,
    searchQuery: [...new Set(terms.flatMap(groupsFor))].join(' ') };
}

function hitWeight(term, tokens) {
  if (tokens.has(stem(term))) return 1;
  return groupsFor(term).some(other => tokens.has(stem(other))) ? (['desemprego', 'desocupacao', 'inflacao', 'ipca'].includes(term) ? 1 : 0.8) : 0;
}
const noMatch = contextUsed => ({ found: false, contextUsed, passages: [], pages: [],
  message: 'Não encontrei trechos suficientemente relacionados no acervo. Tente indicar um tema, indicador ou período.' });

export function selectAnswer(question, documents, previousQuestion = '') {
  const prepared = prepareQuestion(question, previousQuestion);
  const { terms, entities, contextUsed } = prepared;
  if (!terms.length) return { ...noMatch(false), message: 'Escreva o assunto que deseja consultar. Por exemplo: inflação em 2025 ou privatização da Eletrobras.' };
  const candidates = [];
  for (const doc of documents) {
    if (doc.isIndex || !Array.isArray(doc.passages)) continue;
    const titleTokens = tokenSet(doc.title);
    for (const passage of doc.passages) {
      const textTokens = tokenSet(passage.text);
      const headingTokens = tokenSet(`${doc.title} ${passage.section}`);
      const combined = `${doc.title} ${passage.section} ${passage.text}`;
      if (entities.length && !entities.some(entity => hasWord(combined, entity))) continue;
      // A named mandate must appear explicitly, instead of silently choosing another Lula term.
      const mandate = normalize(question).match(/\blula\s*([123])\b/);
      if (mandate && hasWord(combined, 'lula') && !new RegExp(`\\blula\\s*${mandate[1]}\\b`).test(normalize(combined))) continue;
      let bodyHits = 0, coverage = 0, score = 0;
      for (const term of terms) {
        const body = hitWeight(term, textTokens), heading = hitWeight(term, headingTokens);
        bodyHits += body;
        coverage += Math.max(body, heading * 0.7);
        score += body * 3 + heading * 1.2 + hitWeight(term, titleTokens) * 3;
      }
      // At least one topical word has to occur in the excerpt itself, not just the title.
      const topicalTerms = terms.filter(term => !ENTITIES.includes(term) && !/^\d+$/.test(term));
      if (topicalTerms.length && !topicalTerms.some(term => hitWeight(term, textTokens))) continue;
      if (!bodyHits || coverage / terms.length < 0.55) continue;
      const count = passage.text.split(/\s+/).length;
      if (count > 150 || passage.text.length > 1150) continue;
      // Short, self-contained excerpts are preferable to long catalog rows or introductions.
      score += Math.min(0.8, passage.sources?.length * 0.2 || 0);
      score -= Math.max(0, count - 65) * 0.02;
      // Apply the same evidence-first preference to every chapter and political actor.
      if (/quadro de evidencias|evidencia e significado|resultados reproduziveis/.test(normalize(passage.section))) score += 1;
      if (/memoria de calculo/.test(normalize(passage.section)) && !/calcul|metod|formula/.test(normalize(question))) score -= 1;
      if (/conclus|limites/.test(normalize(passage.section))) score += 0.25;
      if (/^(BASE_FONTES|DICIONARIO|METODOLOGIA)/.test(doc.path) && !/significa|defin|conceito|codigo|consultar|calcular|medir/.test(normalize(question))) score -= 2;
      candidates.push({ ...passage, path: doc.path, title: doc.title, category: doc.category,
        evidencePeriod: doc.evidencePeriod, score, words: count });
    }
  }
  candidates.sort((a,b) => b.score - a.score || a.path.localeCompare(b.path) || a.anchor.localeCompare(b.anchor));
  if (!candidates.length) return noMatch(contextUsed);
  const selected = [], used = new Set();
  let wordCount = 0;
  const add = candidate => {
    if (!candidate || used.has(candidate.path) || (selected.length && wordCount + candidate.words > 200)) return;
    selected.push(candidate); used.add(candidate.path); wordCount += candidate.words;
  };
  const actors = ACTORS.filter(actor => hasWord(question, actor));
  if (actors.length > 1) {
    // Preserve coverage of both named sides; don't answer a comparison with only one of them.
    for (const actor of actors) add(candidates.find(candidate => hasWord(`${candidate.title} ${candidate.text}`, actor)));
    if (actors.some(actor => !selected.some(candidate => hasWord(`${candidate.title} ${candidate.text}`, actor)))) {
      return { ...noMatch(contextUsed), message: 'Encontrei material parcial, mas não trechos comparáveis para todos os nomes citados. Especifique o indicador e os períodos.' };
    }
  }
  for (const candidate of candidates) { if (selected.length >= 2) break; add(candidate); }
  const pages = [];
  const pagePaths = new Set(used);
  for (const candidate of candidates) {
    if (pagePaths.has(candidate.path)) continue;
    pages.push({ path: candidate.path, title: candidate.title, anchor: candidate.anchor });
    pagePaths.add(candidate.path);
    if (pages.length === 2) break;
  }
  return { found: true, contextUsed, message: 'Encontrei estes trechos nos documentos:', passages: selected, pages };
}
