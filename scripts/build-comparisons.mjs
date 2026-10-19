import fs from 'node:fs';
const read = name => JSON.parse(fs.readFileSync(`data/snapshots/${name}.json`, 'utf8'));
const ipca = read('ipca'), pib = read('pib'), debt = read('dbgg');
const index = new Map(ipca.data.slice(1).map(row => {
  const period = Object.entries(row).find(([key, value]) => /^D\d+C$/.test(key) && /^\d{4}12$/.test(value));
  if (!period || row.D2C !== '2266' || row.MN !== 'Número-índice') throw new Error('Definição IPCA incompatível.');
  return [Number(period[1].slice(0, 4)), Number(row.V)];
}));
const growth = new Map(pib.data.slice(1).map(row => {
  if (row.D2C !== '6563' || row.D4C !== '90707' || !row.D3C.endsWith('04') || row.MN !== '%') throw new Error('Definição PIB incompatível.');
  return [Number(row.D3C.slice(0, 4)), Number(row.V)];
}));
const decemberDebt = new Map(debt.data.filter(row => /^01\/12\/\d{4}$/.test(row.data)).map(row => [Number(row.data.slice(-4)), Number(row.valor)]));
const periods = [
  ['FHC 2',1999,2002], ['Lula 1',2003,2006], ['Lula 2',2007,2010], ['Dilma 1',2011,2014],
  ['Crise e transição Dilma–Temer',2015,2016], ['Temer, anos completos',2017,2018], ['Bolsonaro',2019,2022], ['Lula 3, recorte parcial',2023,2025],
];
const rows = periods.map(([label, start, end]) => {
  const years = end - start + 1;
  const gdpFactor = Array.from({ length: years }, (_, i) => {
    const value = growth.get(start + i); if (!Number.isFinite(value)) throw new Error(`PIB ausente ${start+i}`); return 1 + value / 100;
  }).reduce((a,b) => a*b,1);
  const priceFactor = index.get(end) / index.get(start - 1);
  if (!Number.isFinite(priceFactor)) throw new Error(`IPCA ausente ${label}`);
  return { label, start, end, years, ipcaAccumulated: (priceFactor-1)*100,
    ipcaAnnualized: (priceFactor**(1/years)-1)*100,
    gdpAccumulated: (gdpFactor-1)*100, gdpAnnualized: (gdpFactor**(1/years)-1)*100,
    debtStart: decemberDebt.get(start-1) ?? null, debtEnd: decemberDebt.get(end) ?? null,
    debtChangePP: decemberDebt.has(start-1) && decemberDebt.has(end) ? decemberDebt.get(end)-decemberDebt.get(start-1) : null };
});
const payload = { reviewedAt:'2026-10-19', reportingPeriod:'1999–2025; anos civis encerrados',
  sources:[ipca.source,pib.source,debt.source], notes:['PIB composto a partir das taxas anuais publicadas com a precisão disponibilizada.','Recortes têm durações diferentes; médias geométricas anualizadas reduzem o efeito mecânico da duração, sem identificar causalidade.','2015–2016 é período misto, não atribuído integralmente a um presidente.','DBGG na mesma metodologia disponível desde dezembro de 2006; ausências preservadas como nulo.'], rows };
fs.writeFileSync('data/comparisons.json',JSON.stringify(payload,null,2));
const fmt = value => value === null ? 'Não disponível' : value.toFixed(2).replace('.',',');
const table = rows.map(r => `| ${r.label} (${r.start}–${r.end}) | ${fmt(r.ipcaAccumulated)}% | ${fmt(r.ipcaAnnualized)}% | ${fmt(r.gdpAccumulated)}% | ${fmt(r.gdpAnnualized)}% | ${fmt(r.debtEnd)}${r.debtEnd===null?'':'%'} | ${fmt(r.debtChangePP)}${r.debtChangePP===null?'':' p.p.'} |`).join('\n');
const text = `# Comparação de períodos de governo com bases uniformes

> **Revisão editorial:** 19/10/2026.
> **Recorte da evidência:** anos civis completos de 1999 a 2025; resposta oficial preservada nesta edição. O recorte de Lula 3 é parcial e não inclui projeção de 2026.

Esta comparação usa a mesma definição de cada indicador ao longo do tempo. Períodos têm durações diferentes; por isso os acumulados aparecem acompanhados de médias geométricas anualizadas. Não é um ranking de mérito presidencial. A separação 2015–2016 preserva o período de crise e transição, sem atribuir todo o ano de 2016 a Dilma ou Temer.

## Resultados reproduzíveis

| Período | IPCA acumulado | IPCA anualizado | PIB real acumulado | PIB real anualizado | DBGG no fim | Mudança da DBGG |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
${table}

A DBGG inicial de cada recorte é o estoque em dezembro do ano anterior; a mudança é medida em pontos percentuais do PIB. O fim de Lula 1 está disponível na metodologia, mas o início não: por isso a variação não é preenchida. Não se usa outra série para fabricar continuidade.

## Fontes e memória de cálculo

- **IPCA:** [IBGE SIDRA 1737](https://sidra.ibge.gov.br/tabela/1737), variável 2266, número-índice de dezembro, base dezembro/1993 = 100; Brasil. Acumulado = (índice final / índice inicial − 1) × 100. A resposta está em \`data/snapshots/ipca.json\`.
- **PIB:** [IBGE SIDRA 5932](https://sidra.ibge.gov.br/tabela/5932), variável 6563, quarto trimestre, categoria 90707 (PIB a preços de mercado); Brasil. Fator acumulado = produto de (1 + taxa anual / 100). Resposta em \`data/snapshots/pib.json\`.
- **Dívida:** [BCB SGS 13762](https://dadosabertos.bcb.gov.br/dataset/13762-divida-bruta-do-governo-geral--pib---metodologia-utilizada-a-partir-de-2008), dezembro, percentual do PIB; metodologia a partir de 2008 com série retroativa a dezembro/2006. Resposta em \`data/snapshots/dbgg.json\`.

A fórmula de composição de preços utiliza o número-índice inicial e o final:

$$
\\pi_{acumulada}=100\\left(\\frac{I_{final}}{I_{inicial}}-1\\right)
$$

A taxa anualizada de um fator composto F em n anos é (F elevado a 1/n − 1) × 100. O script \`scripts/build-comparisons.mjs\` reconstitui o quadro a partir das respostas preservadas, sem consultar a rede. As URLs exatas e a data de acesso estão nos arquivos. O PIB usa taxas divulgadas com arredondamento, não uma reconstrução de precisão superior à fonte. Revisões oficiais futuras devem criar uma nova versão explicitada.

## Interpretações concorrentes

Uma inflação menor pode refletir política monetária, demanda, oferta, câmbio, tributos e preços externos. Crescimento pode refletir capacidade produtiva, recuperação cíclica, composição setorial e política fiscal. Uma mudança de dívida/PIB combina saldo primário, juros, crescimento, inflação e ajustes patrimoniais. O quadro descreve resultados; não isola o peso de cada mecanismo.

A hipótese de que uma política explica uma diferença precisa ser confrontada com sua vigência, defasagem, choques externos e grupos expostos. Uma interpretação liberal, desenvolvimentista ou institucional deve passar pelo mesmo teste, sem transformar alinhamento político em evidência.

## Efeitos distributivos

IPCA e PIB nacionais não descrevem a experiência de todos. Inflação por cesta de consumo, renda mediana, trabalho informal, desemprego por grupo e diferenças regionais podem mudar a avaliação de um mesmo período. Este quadro não possui microdados distributivos e não estima esses efeitos; os [estudos de desigualdade](desenvolvimento_humano_e_territorio/04_desigualdades_e_desenvolvimento_regional.md) definem os recortes adequados. DBGG mais alta também não revela sozinha quem recebeu os gastos ou quem arcou com tributos.

## Conclusão e limites da evidência

A comparação elimina trocas de código, soma indevida de taxas e mistura silenciosa de conceitos dentro destes três indicadores. Ela permite descrever inflação, crescimento e dívida em recortes explícitos. Não demonstra desempenho causal de um presidente, não equipara mandatos de duração diferente e não substitui análise de emprego, pobreza, produtividade ou serviços públicos. O [dicionário](DICIONARIO_INDICADORES.md) e o [método](METODOLOGIA.md) governam ampliações deste quadro.
`;
fs.writeFileSync('COMPARACOES_GOVERNOS.md',text);
console.log(`[comparisons] ${rows.length} períodos; ${growth.size} taxas PIB; ${index.size} índices IPCA.`);
