# Catálogo de fontes e critérios de uso

> **Revisão editorial:** 19/10/2026.
> **Recorte da evidência:** catálogo metodológico; cada extração deve declarar sua própria data e edição.

Este catálogo identifica produtores e bases. A presença de um órgão respeitado não valida automaticamente uma afirmação: é necessário conferir indicador, unidade, população, período e trecho que sustenta a conclusão. Séries privadas, pesquisas acadêmicas e jornalismo podem complementar fontes públicas, com natureza e limitações identificadas. Não se promete exclusividade de fontes oficiais nem certificação de neutralidade.

Leia a [metodologia](METODOLOGIA.md), as [definições operacionais](DICIONARIO_INDICADORES.md) e as [comparações reproduzíveis](COMPARACOES_GOVERNOS.md). Os links abaixo são pontos de consulta; as evidências de um capítulo devem aparecer junto da afirmação correspondente.

## Economia, emprego e finanças públicas

| Tema | Base e referência | Critério de uso |
|---|---|---|
| Inflação | [SIDRA 1737](https://sidra.ibge.gov.br/tabela/1737), variável 2266: número-índice do IPCA; [7060](https://sidra.ibge.gov.br/tabela/7060): detalhamento por grupos | Compor variações; não somar taxas anuais. Informar mês-base e cesta; inflação pessoal pode divergir da média. |
| Juros | [SGS/BCB](https://www3.bcb.gov.br/sgspub/): 432, meta Selic; 1178, Selic efetiva anualizada em 252 dias úteis | Meta e taxa efetiva não são a mesma série. Juro real exige horizonte e medida de inflação compatíveis. |
| Crédito | [BCB, estatísticas monetárias e de crédito](https://www.bcb.gov.br/estatisticas/estatisticasmonetariascredito) | SGS 20714 mede taxa média do crédito total; 20715, pessoas jurídicas. Esses códigos não designam rotativo do cartão e cheque especial. Verificar modalidade e unidade antes de extrair. |
| Desocupação e subutilização | [SIDRA 4099](https://sidra.ibge.gov.br/tabela/4099): variáveis 4099 e 4118, respectivamente | Desocupados/força de trabalho e subutilizados/força de trabalho ampliada têm denominadores diferentes. Esta tabela usa trimestres civis; distinguir de divulgações por trimestres móveis, que se sobrepõem. |
| Informalidade | [SIDRA 4093](https://sidra.ibge.gov.br/tabela/4093), variável 12466 | Taxa entre ocupados; não é a tabela 4097 nem sinônimo de desemprego. |
| Rendimentos | [SIDRA 5436](https://sidra.ibge.gov.br/tabela/5436), variável 5933 | Rendimento médio real habitual de todos os trabalhos. A tabela 5434 trata de ocupados por atividade, não de renda. |
| Emprego formal | [Novo Caged/MTE](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/novo-caged) | Vínculos, admissões e desligamentos administrativos; não misturar seu saldo com estoque de pessoas da PNAD Contínua. |
| PIB | [SIDRA 5932](https://sidra.ibge.gov.br/tabela/5932), variável 6563, categoria PIB 90707 | Variação acumulada no ano; usar quarto trimestre para ano completo. Distinguir volume, valor corrente e ajuste sazonal. |
| Dívida bruta | [SGS 13762, API com período explícito](https://api.bcb.gov.br/dados/serie/bcdata.sgs.13762/dados?formato=json&dataInicial=01/12/2024&dataFinal=31/12/2025) | DBGG em % do PIB, metodologia vigente desde 2008, com série retroativa a 2006. SGS 4505 é dívida líquida, não DBGG. Mudanças da razão podem vir do numerador e do PIB. |
| Resultado fiscal | [Resultado do Tesouro Nacional](https://www.gov.br/tesouronacional/pt-br/estatisticas-fiscais-e-planejamento/resultado-do-tesouro-nacional-rtn), [BCB fiscal](https://www.bcb.gov.br/estatisticas/estatisticasfiscais), [IFI](https://www12.senado.leg.br/ifi) | Governo central e setor público consolidado têm coberturas distintas; primário exclui juros, nominal os inclui. Projeções da IFI são cenários. |
| Tributação | [Receita, carga tributária](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/estudos/carga-tributaria) e [LC 200/2023](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp200.htm) | Carga/PIB não mede isoladamente incidência por renda. No arcabouço, a regra de 70% trata do crescimento real de receita elegível, com exceções e banda, não de gastar 70% da receita total. |
| Comércio e produção | [Comex Stat](https://comexstat.mdic.gov.br/), [Conab](https://www.conab.gov.br/info-agro/safras/graos), [INDEC, contas nacionais argentinas](https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-9-47) | Exportações brutas não equivalem a valor adicionado; safra é uma estimativa revisável. Comparar países em moeda, preços e períodos compatíveis. |

## Condições de vida e desenvolvimento

| Tema | Produtor e base | Cuidado necessário |
|---|---|---|
| Pobreza e desigualdade | [IBGE, Síntese de Indicadores Sociais](https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html) | Declarar edição, linha, PPC e unidade. Limiares do Banco Mundial mudaram com a revisão de PPC; não concatenar linhas antigas e novas como uma série homogênea. |
| Alimentação | [IBGE, segurança alimentar](https://www.ibge.gov.br/estatisticas/sociais/saude/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html) e [FAO/SOFI](https://www.fao.org/publications/sofi/en/) | EBIA mede experiência domiciliar; prevalência de subalimentação da FAO é outra medida, frequentemente publicada em médias trienais. Não converter uma na outra. |
| Programas sociais | [MDS, dados e estudos](https://www.gov.br/mds/pt-br/servicos/sagi) | Famílias beneficiárias, pessoas e inscrições no Cadastro Único não são contagens intercambiáveis; cobertura não demonstra efeito causal. |
| Aprendizagem | [Inep, Ideb](https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb) e [PISA](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/pisa) | Ideb combina fluxo e desempenho; PISA avalia estudantes de 15 anos elegíveis. Informar etapa, rede, edição e incerteza. |
| Saúde | [Datasus/Tabnet](https://datasus.saude.gov.br/informacoes-de-saude-tabnet/) | CNES é cadastro de capacidade; SIH registra internações financiadas pelo SUS; SIM, óbitos; SINASC, nascidos vivos. Cobertura e qualidade do registro afetam comparações. |
| Moradia e saneamento | [IBGE, Censo 2022: domicílios](https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22064-caracteristicas-dos-domicilios-censo-2022.html) | Domicílios e moradores diferem. Conexão a rede coletora não comprova tratamento do esgoto. |
| Segurança | [Ipea, Atlas da Violência](https://www.ipea.gov.br/atlasviolencia/) e [Sinesp/MJSP](https://www.gov.br/mj/pt-br/assuntos/sua-seguranca/seguranca-publica/estatistica) | Mortalidade do SIM e ocorrências policiais têm conceitos e subnotificações distintos. Comparar taxas com população e período compatíveis. |
| Clima e uso da terra | [IPCC, AR6 síntese](https://www.ipcc.ch/report/ar6/syr/), [INPE/TerraBrasilis](https://terrabrasilis.dpi.inpe.br/), [Cemaden](https://www.gov.br/cemaden/pt-br) | DETER emite alertas; PRODES estima desmatamento anual segundo seu recorte. Desmatamento não é todo o inventário de emissões; risco depende de exposição e vulnerabilidade. |
| Produtividade e inovação | [IBGE, Pintec](https://www.ibge.gov.br/estatisticas/multidominio/ciencia-tecnologia-e-inovacao/9141-pesquisa-de-inovacao.html), [Ipea](https://www.ipea.gov.br/) e contas nacionais | A tabela SIDRA 6433 pertence a inovação empresarial, não a subutilização do trabalho. Patentes, investimento em P&D e produtividade são conceitos distintos. |

## Leis, investigações e discursos

Consultar o [Planalto](https://www.planalto.gov.br/legislacao), a [Câmara](https://www.camara.leg.br/), o [Senado](https://www25.senado.leg.br/web/atividade), o [STF](https://portal.stf.jus.br/), a [CGU](https://www.gov.br/cgu/pt-br) e o [TCU](https://portal.tcu.gov.br/). Uma notícia institucional permite localizar um evento; o inteiro teor é necessário para atribuir fundamentos, alcance, votos e condições.

Cada caso deve identificar pessoa, ato, órgão, processo quando confirmado, data do ato e situação processual documentada. Denúncia da acusação e argumento da defesa devem ser atribuídos. Arquivamento, anulação, absolvição e trânsito em julgado têm efeitos diferentes. Não inferir culpa por associação nem declarar atual um desfecho sem consulta recente.

Discursos exigem gravação ou transcrição integral, data e contexto. Citação literal sem localização verificável deve ser retirada ou explicitamente tratada como não confirmada. Interpretar uma fala não permite concluir sozinho a natureza de todo um regime.

## Fontes privadas e estudos acadêmicos

A [Serasa Experian](https://www.serasaexperian.com.br/sala-de-imprensa/indicadores/recuperacoes-judiciais-avancam-no-brasil-e-atingem-25-mil-empresas-em-2025-maior-nivel-da-serie-aponta-serasa-experian/) é produtora privada de indicadores. Na divulgação de 2025, 977 processos e 2.466 CNPJs são unidades distintas; a metodologia revisada impede misturar manchetes de séries antigas e novas. O antigo domínio híbrido `serasaconsexperian.com.br` estava incorreto e foi retirado dos links.

Relatórios de empresas, [CVM](https://www.gov.br/cvm/pt-br) e [B3](https://www.b3.com.br/) documentam demonstrações e eventos, mas uma apresentação comercial não substitui balanço auditado. Ratings devem dizer escala nacional ou global, agência, entidade e data.

Estudos de jornada, concessões e transferências devem informar seleção da amostra, grupo de comparação, perdas de observação e horizonte. Um piloto voluntário não estabelece o efeito nacional de uma mudança legal. Fontes secundárias servem também para fiscalizar a narrativa institucional, com sua origem identificada.

## Extrações reproduzíveis

Os arquivos em `data/snapshots/` guardam URL, data de acesso e resposta original de três séries históricas usadas no projeto. Para regenerar as comparações a partir desses arquivos, execute `node scripts/build-comparisons.mjs`. A coleta é separada do build: uma revisão estatística não deve alterar silenciosamente uma conclusão publicada.

Nesta segunda conferência, as respostas de metadados das tabelas **1737, 7060, 5932, 6784, 4099, 4093, 5436, 5434 e 6433** foram lidas diretamente no serviço do IBGE e preservadas em `.audit/indicator-metadata-2.json`. Isso permite verificar nomes, variáveis, unidades e periodicidade efetivamente consultados; não certifica automaticamente qualquer valor ou interpretação produzido a partir dessas tabelas.

No SGS, fixe `dataInicial` e `dataFinal`, consulte o nome e a unidade no catálogo e trate erros HTTP como falha, nunca como zero. No SIDRA, a primeira linha descreve os campos; descubra as dimensões pelo cabeçalho em vez de presumir que `D3N` sempre é mês. Valores `...`, `-` e `X` não são zeros. Arquive a resposta antes de calcular.

## Efeitos distributivos

Uma média nacional pode encobrir diferenças por renda, raça/cor, sexo, idade, território, condição de emprego e acesso a serviços. Desagregar quando a amostra e a fonte permitirem; quando não permitirem, registrar a lacuna e evitar preencher grupos ausentes por suposição.

## Conclusão e limites da evidência

O catálogo corrige identificadores e orienta o uso, mas não certifica todas as respostas futuras dessas APIs. A responsabilidade da análise continua sendo conferir a versão efetivamente consultada, vincular a evidência à afirmação e limitar a conclusão ao que o desenho da pesquisa permite.
