import fs from 'node:fs';
import path from 'node:path';
import { extractLinks, extractHeadings, resolveDocumentLink } from '../shared/content.mjs';
const documents = JSON.parse(fs.readFileSync('src/data/content.json', 'utf8'));
const byPath = new Map(documents.map(doc => [doc.path, doc]));
const errors = [];
let internalLinks = 0, sourceLinks = 0, studies = 0;
const report = [];
for (const doc of documents) {
  const text = fs.readFileSync(doc.path, 'utf8');
  const issues = [];
  if (text !== doc.rawContent) issues.push('Conteúdo gerado desatualizado; execute build-content.');
  if (!doc.reviewedAt || !doc.evidencePeriod) issues.push('Falta revisão editorial ou recorte da evidência.');
  const headings = extractHeadings(text);
  if (new Set(headings.map(h => h.id)).size !== headings.length) issues.push('IDs de títulos repetidos.');
  if (headings.filter(h => h.level === 1).length !== 1) issues.push('Deve haver exatamente um título principal.');
  if (doc.fileName !== 'README.md') {
    studies++;
    if (!headings.some(h => h.text === 'Efeitos distributivos')) issues.push('Falta seção Efeitos distributivos.');
    if (!headings.some(h => h.text === 'Conclusão e limites da evidência')) issues.push('Falta conclusão delimitada.');
    if (!doc.sources.length && doc.fileName !== 'VERIFICACAO_INCREMENTOS.md') issues.push('Sem fonte externa identificada.');
  }
  for (const link of extractLinks(text)) {
    if (/^file:/i.test(link.url)) { issues.push(`Linha ${link.line}: link file:// não portátil.`); continue; }
    if (/^https?:/i.test(link.url)) { sourceLinks++; continue; }
    if (/^[a-z][a-z\d+.-]*:/i.test(link.url)) continue;
    const resolved = resolveDocumentLink(doc.path, link.url);
    if (!resolved) { issues.push(`Linha ${link.line}: caminho inválido ${link.url}`); continue; }
    internalLinks++;
    if (resolved.path.endsWith('.md')) {
      const target = byPath.get(resolved.path);
      if (!target) issues.push(`Linha ${link.line}: documento ausente ${link.url}`);
      else if (resolved.anchor && !target.headings.some(h => h.id === decodeURIComponent(resolved.anchor))) issues.push(`Linha ${link.line}: âncora ausente ${link.url}`);
    } else if (!fs.existsSync(path.resolve(resolved.path))) issues.push(`Linha ${link.line}: arquivo ausente ${link.url}`);
  }
  if (!fs.existsSync(path.join('public', doc.contentUrl))) issues.push('Documento individual ausente.');
  const item = { path: doc.path, wordCount: doc.wordCount, sources: doc.sources.length, issues };
  report.push(item);
  errors.push(...issues.map(issue => `${doc.path}: ${issue}`));
}
const metadata = JSON.parse(fs.readFileSync('src/data/documents.json', 'utf8'));
if (metadata.some(doc => 'rawContent' in doc || 'plainText' in doc)) errors.push('Metadados incluem corpo completo.');
const baseline = JSON.parse(fs.readFileSync('data/audit-original-paths.json', 'utf8'));
for (const originalPath of baseline) if (!byPath.has(originalPath)) errors.push(`Documento original removido: ${originalPath}`);
const result = { generatedAt: new Date().toISOString(), documents: documents.length, originalDocuments: baseline.length, studies, internalLinks, sourceLinks, errors, report,
  scope: 'Validação estrutural e de rastreabilidade. Não certifica verdade factual, situação processual atual ou disponibilidade externa.' };
fs.mkdirSync('.audit', { recursive: true });
fs.writeFileSync('.audit/content-validation.json', JSON.stringify(result, null, 2));
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`[content] ${documents.length} documentos; ${baseline.length} originais preservados; ${internalLinks} links internos e ${sourceLinks} referências externas; sem erros estruturais.`);
