# Comparação de períodos de governo com bases uniformes

> **Revisão editorial:** 19/10/2026.
> **Recorte da evidência:** anos civis completos de 1999 a 2025; resposta oficial preservada nesta edição. O recorte de Lula 3 é parcial e não inclui projeção de 2026.

Esta comparação usa a mesma definição de cada indicador ao longo do tempo. Períodos têm durações diferentes; por isso os acumulados aparecem acompanhados de médias geométricas anualizadas. Não é um ranking de mérito presidencial. A separação 2015–2016 preserva o período de crise e transição, sem atribuir todo o ano de 2016 a Dilma ou Temer.

## Resultados reproduzíveis

| Período | IPCA acumulado | IPCA anualizado | PIB real acumulado | PIB real anualizado | DBGG no fim | Mudança da DBGG |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| FHC 2 (1999–2002) | 39,88% | 8,75% | 9,69% | 2,34% | Não disponível | Não disponível |
| Lula 1 (2003–2006) | 28,20% | 6,41% | 14,80% | 3,51% | 55,48% | Não disponível |
| Lula 2 (2007–2010) | 22,21% | 5,14% | 19,75% | 4,61% | 51,77% | -3,71 p.p. |
| Dilma 1 (2011–2014) | 27,03% | 6,16% | 9,70% | 2,34% | 56,28% | 4,51 p.p. |
| Crise e transição Dilma–Temer (2015–2016) | 17,63% | 8,46% | -6,68% | -3,40% | 69,84% | 13,56 p.p. |
| Temer, anos completos (2017–2018) | 6,80% | 3,35% | 3,12% | 1,55% | 75,27% | 5,43 p.p. |
| Bolsonaro (2019–2022) | 26,93% | 6,14% | 5,63% | 1,38% | 71,68% | -3,59 p.p. |
| Lula 3, recorte parcial (2023–2025) | 14,35% | 4,57% | 9,16% | 2,97% | 78,64% | 6,96 p.p. |

A DBGG inicial de cada recorte é o estoque em dezembro do ano anterior; a mudança é medida em pontos percentuais do PIB. O fim de Lula 1 está disponível na metodologia, mas o início não: por isso a variação não é preenchida. Não se usa outra série para fabricar continuidade.

## Fontes e memória de cálculo

- **IPCA:** [IBGE SIDRA 1737](https://sidra.ibge.gov.br/tabela/1737), variável 2266, número-índice de dezembro, base dezembro/1993 = 100; Brasil. Acumulado = (índice final / índice inicial − 1) × 100. A resposta está em `data/snapshots/ipca.json`.
- **PIB:** [IBGE SIDRA 5932](https://sidra.ibge.gov.br/tabela/5932), variável 6563, quarto trimestre, categoria 90707 (PIB a preços de mercado); Brasil. Fator acumulado = produto de (1 + taxa anual / 100). Resposta em `data/snapshots/pib.json`.
- **Dívida:** [BCB SGS 13762](https://dadosabertos.bcb.gov.br/dataset/13762-divida-bruta-do-governo-geral--pib---metodologia-utilizada-a-partir-de-2008), dezembro, percentual do PIB; metodologia a partir de 2008 com série retroativa a dezembro/2006. Resposta em `data/snapshots/dbgg.json`.

A fórmula de composição de preços utiliza o número-índice inicial e o final:

$$
\pi_{acumulada}=100\left(\frac{I_{final}}{I_{inicial}}-1\right)
$$

A taxa anualizada de um fator composto F em n anos é (F elevado a 1/n − 1) × 100. O script `scripts/build-comparisons.mjs` reconstitui o quadro a partir das respostas preservadas, sem consultar a rede. As URLs exatas e a data de acesso estão nos arquivos. O PIB usa taxas divulgadas com arredondamento, não uma reconstrução de precisão superior à fonte. Revisões oficiais futuras devem criar uma nova versão explicitada.

## Interpretações concorrentes

Uma inflação menor pode refletir política monetária, demanda, oferta, câmbio, tributos e preços externos. Crescimento pode refletir capacidade produtiva, recuperação cíclica, composição setorial e política fiscal. Uma mudança de dívida/PIB combina saldo primário, juros, crescimento, inflação e ajustes patrimoniais. O quadro descreve resultados; não isola o peso de cada mecanismo.

A hipótese de que uma política explica uma diferença precisa ser confrontada com sua vigência, defasagem, choques externos e grupos expostos. Uma interpretação liberal, desenvolvimentista ou institucional deve passar pelo mesmo teste, sem transformar alinhamento político em evidência.

## Efeitos distributivos

IPCA e PIB nacionais não descrevem a experiência de todos. Inflação por cesta de consumo, renda mediana, trabalho informal, desemprego por grupo e diferenças regionais podem mudar a avaliação de um mesmo período. Este quadro não possui microdados distributivos e não estima esses efeitos; os [estudos de desigualdade](desenvolvimento_humano_e_territorio/04_desigualdades_e_desenvolvimento_regional.md) definem os recortes adequados. DBGG mais alta também não revela sozinha quem recebeu os gastos ou quem arcou com tributos.

## Conclusão e limites da evidência

A comparação elimina trocas de código, soma indevida de taxas e mistura silenciosa de conceitos dentro destes três indicadores. Ela permite descrever inflação, crescimento e dívida em recortes explícitos. Não demonstra desempenho causal de um presidente, não equipara mandatos de duração diferente e não substitui análise de emprego, pobreza, produtividade ou serviços públicos. O [dicionário](DICIONARIO_INDICADORES.md) e o [método](METODOLOGIA.md) governam ampliações deste quadro.
