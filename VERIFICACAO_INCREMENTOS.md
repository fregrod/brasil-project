# Registro de verificação dos incrementos

> **Revisão editorial:** 19/10/2026.
> **Recorte da evidência:** implementação e checagem desta edição do repositório; resultados da validação local e limites das fontes, sem atualização automática externa.

Este registro acompanha a implementação da auditoria em quatro frentes: arquitetura, fontes, revisão documental e ampliação do conteúdo. A linha comum é evidência, mecanismo, distribuição e conclusão delimitada.

## Entregas e evidência

| Frente | Entrega | Verificação |
|---|---|---|
| Arquitetura | Documento individual, recursos sob demanda, busca pré-indexada e cache imutável | Build, limite de transferência inicial e navegação no navegador. |
| Leitura | IDs de títulos, links relativos e âncoras compartilháveis, moeda e fórmulas distintas, espaço responsivo | Testes de regressão, links internos e inspeção de interface. |
| Grafo | Desenho por evento, pausa quando oculto e filtros preservando câmera | Revisão de código e interação; relações explicitamente editoriais. |
| Fontes | Catálogo e dicionário corrigidos, proveniência e limites | Referências junto das afirmações, códigos conferidos e snapshots das comparações. |
| Documentos | Todos os 47 originais revisados, sem remoção de arquivos | Lista original preservada em `data/audit-original-paths.json`; validação por documento. |
| Comparação | IPCA, PIB e DBGG em definições uniformes, períodos explícitos | Memória de cálculo reproduzível e testes de resultados. |
| Conteúdo | Seis novos estudos e índice de desenvolvimento humano e território | Estrutura, fontes, distribuição e conclusão em cada estudo. |
| Manutenção | Método editorial e checagens integradas ao build | `npm test`, `npm run typecheck`, `npm run check:content` e `npm run build`. |

## Resultados da execução

- **58 documentos integrados**, incluindo os **47 originais**, seis estudos novos, índice temático e quatro documentos de método/comparação/verificação.
- Na primeira rodada, foram conferidos **95 links internos** e **622 ocorrências de referências externas**, sem erros estruturais. A segunda rodada ampliou as referências; os totais atuais estão em `.audit/content-validation.json`.
- **13 testes de regressão aprovados**, incluindo sete de extração e consulta documental, checagem TypeScript e build de produção aprovados. A integração contínua executa testes e build em push e pull request.
- Entrada do aplicativo: aproximadamente **118 KB gzip**. Entrada mais leitor Markdown: aproximadamente **225 KB gzip**, frente a **633 KB gzip** de JS/CSS inicialmente carregados na versão auditada. São tamanhos locais de arquivos comprimidos; não são medição de rede móvel, tempo de interação ou memória. Documento selecionado e fontes tipográficas externas ficam fora dessa conta; matemática, diagramas, busca e grafo acrescentam recursos quando abertos.
- Os documentos individuais produzidos em `dist/content` foram comparados com a origem. A busca tem índice previamente gerado e compartilhado com o painel de consulta, carregado ao pesquisar ou enviar a primeira pergunta; nesta edição, aproximadamente **251 KB gzip**, incluindo trechos, âncoras, fontes e recortes.
- Navegação, pesquisa, âncoras, compartilhamento, valores em reais, fórmula, filtros/zoom do grafo e menu estreito foram exercitados no navegador. A leitura foi inspecionada em aproximadamente **1280 px** e em **iframe de 390 px**; isso não certifica todos os navegadores ou aparelhos físicos.
- A última checagem HTTP cobriu **364 URLs únicas**, sem retorno 404/410 após as correções. Houve respostas bloqueadas, autenticação, limitação de acesso e falhas de rede/TLS. Status 200 ou 206 também não certifica que a página sustenta a afirmação. Não se declara disponibilidade universal das fontes.

Os relatórios em `.audit/content-validation.json`, `.audit/bundle.json`, `.audit/source-access.json` e `.audit/incrementos.json` permitem inspecionar a execução. `npm run check:sources` repete apenas o teste de acesso HTTP, separado do build e da validação factual.

## Consulta documental no navegador

O painel direito seleciona até dois trechos existentes, com até 200 palavras no total, sem completar frases, combinar números ou formular novas conclusões. Linhas de tabela mantêm os nomes das colunas; parágrafos preservam suas ressalvas. Cada resultado abre a seção original e mostra as fontes que aparecem no próprio trecho. O recorte histórico do documento pode ser expandido em cada cartão. A seleção aplica os mesmos critérios de correspondência a todos os atores; não é garantia de exaustividade ou de ausência de viés nos textos de origem.

Não há pesos de modelo nem API de inferência. Código adicional do painel e índice compartilhado somam aproximadamente **264 KB gzip**, com orçamento de **500 KB gzip** verificado no build. O índice cresce com o acervo e é processado no navegador; os números exatos da compilação atual estão em `.audit/bundle.json`. Não foi medida memória ou latência em aparelho físico.

Os testes cobrem inflação, desocupação, saneamento, privatização, continuação de pergunta, presença dos dois nomes numa comparação, preservação literal, âncoras e recusa de perguntas sem correspondência. A interface foi exercitada no desktop e em iframe de 390 px, incluindo abertura, envio, fechamento por Escape e retorno do foco. O mecanismo usa termos e relações predefinidas: perguntas ambíguas podem omitir documentos relevantes. Resultados de períodos ou metodologias diferentes não se tornam comparáveis por aparecerem juntos. A pesquisa e a leitura das páginas continuam necessárias para conferir o contexto.

## Segunda conferência factual, em 19/10/2026

**Avaliação: compartilhar com ressalvas. Cobertura factual parcial, com reparos aplicados.** O inventário abrange os 58 documentos; os 41 estudos substantivos foram relidos. Há **169 registros de checagem focal**, vinculados a **150 URLs distintas**, além de nove respostas de metadados do IBGE e recálculo independente dos oito períodos da comparação macroeconômica. Registros podem agrupar mais de um número e incluem modalidades de leitura diferentes: não são 169 fatos universalmente certificados nem um percentual de acurácia.

A trilha versionada está em `data/factual-review-2026-10-19.json`: documento, hash, alegação, fonte, localização, modalidade de acesso e pendências. Os detalhes locais estão em `.audit/review-root-2.json`, `.audit/review-economia-2.json`, `.audit/review-judicial-2.json` e `.audit/review-sociedade-2.json`. Abertura integral, extração focal/indexada e bloqueio de abertura não são tratados como a mesma evidência.

### Correções e complementos materiais

| Tema | Resultado da segunda conferência |
|---|---|
| Trabalho e 6x1 | A análise distingue a PEC original da EC 141/2026, publicada em 16/10, seus prazos e exceções. Não apresenta 40 horas como transição já concluída. |
| INSS | Incluída a Lei 15.327/2026; separados os denominadores de beneficiários e de descontos na auditoria CGU, sem converter movimentação investigada em prejuízo comprovado. |
| BNDES | A auditoria de 2019–2020 é confrontada com admissão empresarial e resoluções posteriores do DOJ/SEC. A referência ao Acórdão 3.077/2018 foi identificada como relativa a outro assunto. Preservadas as diferenças entre empresa, pessoa e operação. |
| Processos e emendas | Corrigida a lista de ADPFs de RP9; acrescentadas decisões originais sobre vacinação, Marcelo Odebrecht, indultos, atos do Banco Master e exoneração ministerial, com alcance individualizado. |
| Economia e empresas | Reposto quadro anual Eletrobras 2024–2025 com bases separadas; localizados atos de remediação anteriores à capitalização; completada a trajetória semestral argentina de pobreza/indigência e distinguido resultado fiscal anual do mês de dezembro. |
| Geopolítica e instituições | Documentada a aplicação provisória do iTA Mercosul–UE desde maio/2026, a quitação efetiva do FMI, o voto original de Bolsonaro em 2016, as aprovações de Zanin/Dino e o relatório final do Centro Carter. |
| Desenvolvimento humano | Educação atualizada com Ideb 2025 e preservação da referência 2023. Saneamento distingue rede de outras soluções e moradores de domicílios; clima confrontado com IPCC e documentação DETER. |
| Matriz internacional | Cada uma das 25 economias tem regra nacional específica e fonte, com unidades, cobertura e exceções. Os diferentes benefícios não viram um ranking nem uma comparação numérica harmonizada. |

### Cálculos e respostas originais

As respostas oficiais atuais de IPCA, PIB e DBGG coincidiram com os valores preservados nos snapshots publicados. O SIDRA respondeu em XML no navegador: a conversão para comparação preservou os campos e valores e ignorou apenas dimensões nulas adicionais. O teste independente usou Python/Decimal, sem chamar o gerador JavaScript. Os oito períodos reproduziram as medidas publicadas, inclusive ausências legítimas da dívida. Detalhes: `.audit/source-series-recheck-2.json` e `.audit/independent-calculations-2.json`.

### Cobertura e limites restantes

Os totais abaixo são componentes delimitados do acervo, não quantidade de afirmações verificadas. **Zero defeitos observados não significa verificação completa.** A conferência substantiva focal cobre os 41 estudos e o quadro comparativo (42 componentes); índices e documentos de método foram conferidos quanto a coerência e rastreabilidade. Os registros por alegação mostram onde houve leitura parcial ou bloqueio.

| Categoria de qualidade | Defeitos observados | Avaliação |
|---|---|---|
| Utilidade e completude | 2 / 42 | Permanecem duas comparações centrais incompletas: indicadores internacionais homogêneos e Eletrobras antes de 2022 com mesmo perímetro. Lacunas explícitas, sem preenchimento inventado. |
| Clareza analítica | 0 / 42 | Conceitos, períodos e inferências revistos; não foi medida compreensão dos leitores. |
| Consistência visual e interação | N/A | Inspeção focal do leitor, tabelas e consulta. Corrigida quebra de números dentro das células, mantendo rolagem local. Não se refez auditoria integral de todos os controles. |

| Categoria de correção e robustez | Defeitos observados | Avaliação |
|---|---|---|
| Autoridade e alcance das fontes | 0 / 42 | Erros materiais encontrados foram reparados; há fontes e autos não integralmente reabertos. |
| Valores e cálculos | 0 / 42 | Comparação macro recalculada integralmente; demais contas e valores tiveram checagem dirigida. Não é validação numérica universal. |
| Concordância entre gráficos | N/A | Não há novos gráficos quantitativos nesta rodada; o grafo é editorial. |
| Detalhes de proveniência | 0 / 42 | Alegações selecionadas têm trilha; falta localizar originais de alguns discursos, autos e contratos explicitamente pendentes. |
| Consistência entre documentos | 0 / 42 | Atualizações propagadas a índices e estudos relacionados; não constitui prova de ausência de erro residual. |
| Qualidade e comparabilidade | 2 / 42 | Os dois quadros incompletos acima continuam sem base harmonizada suficiente; não se declara equivalência entre eles. |
| Sustentação das conclusões | 0 / 42 | Não há nova conclusão causal ou penal além da evidência citada; hipóteses e ausências permanecem visíveis. |

Persistem originais de discursos e entrevistas, autos Janus/Bullish, desfechos individualizados, contratos e conciliações financeiras. Também faltam microdados distributivos, fila nacional de saúde e identificação causal dos efeitos das políticas. A segunda conferência reduz erros concretos e aumenta a rastreabilidade; não certifica todo o acervo ou mudanças futuras.

## Arquitetura e crescimento do acervo

Para o acervo atual, a distribuição estática permite servir leitores simultâneos por hospedagem/CDN sem consultas individuais a banco de dados. Documento e bibliotecas pesadas são separados; o leitor não baixa o corpo de todo o repositório. O grafo deixa de redesenhar continuamente depois que a simulação esfria e pausa quando a página fica oculta; filtros não recriam a simulação.

Metadados, índice de busca e grafo ainda crescem com o número de documentos. Isso limita o tamanho de acervo confortavelmente processado no dispositivo, embora não limite a concorrência da mesma forma que um servidor de aplicação. Os orçamentos de build detectam crescimento do custo inicial; um acervo muito maior exigirá dividir metadados, mover pesquisa para worker/serviço ou paginar resultados. Não foi feito ensaio de carga em produção nem medição de bateria/memória em aparelho físico. Os chunks opcionais de alguns diagramas Mermaid continuam grandes e merecem acompanhamento.

## Conferência dos problemas apontados

| Problema da auditoria | Tratamento nesta edição |
|---|---|
| DBGG confundida com dívida líquida; tabelas de renda, informalidade e subutilização trocadas | Códigos corrigidos no catálogo, dicionário e capítulos; definições e unidades explícitas. |
| Pedidos, processos e CNPJs misturados; inflação somada ou sem data final | Unidades separadas e cálculos compostos com recorte; dados preservados nas comparações. |
| Cronologia fiscal, tributação de dividendos e estágio de PEC desatualizados | Norma, versão, vigência e proposta distinguidas; recorte declarado por estudo. |
| Rating, lucro, aviação, câmbio argentino e piloto de jornada com interpretações indevidas | Conceitos, denominadores e alcance corrigidos; efeitos sem base passaram a hipóteses ou pendências. |
| Anulação confundida com absolvição; indiciamento mantido após decisões posteriores | Marcos individualizados em vacinação, golpe, Cabral, Marcos Valério, Master e outros casos. Não se estende o desfecho de uma pessoa a outra. |
| Auditoria BNDES generalizada; falas reconstruídas e setas causais sem suporte | Escopo limitado da auditoria, divergências documentais e citações não confirmadas expostos. Diagrama atual do método representa somente etapas editoriais. |
| Promessa de exclusividade oficial e neutralidade automática | Substituída por fontes identificadas, contraditório pertinente e conclusões proporcionais à evidência. |
| Falta de comparabilidade entre governos | Quadro de três indicadores com duração, médias anualizadas, período misto de 2015–2016 e ausências mantidas como nulo. Não é avaliação causal nem painel social completo. |
| Lacunas temáticas e distributivas | Seis estudos novos, com mecanismo, alternativas, grupos afetados e conclusão. Microdados e estimativas ausentes continuam declarados como lacunas. |
| Peso inicial, links locais, títulos formatados, moeda e corte no desktop/celular | Recursos sob demanda, caminhos relativos/âncoras, normalização de moeda, layout flexível, cabeçalho estreito e testes de regressão. |

## Efeitos distributivos

Os estudos substantivos passaram a explicitar quem pode ganhar, perder ou permanecer excluído. Quando não há dados compatíveis para desagregar, registram a limitação. Não se substitui microdado por inferência extraída da média nacional.

## Conclusão e limites da evidência

Implementar a revisão não equivale a certificar todos os processos judiciais ou legislações estrangeiras em tempo real. A matriz internacional conserva 25 economias, agora com ao menos uma regra nacional específica documentada em cada linha; isso não certifica todos os campos ou a aplicação efetiva dos ordenamentos. Nos casos sem documento original suficiente, retiraram-se detalhes não sustentados ou registrou-se a pendência. Não foram fabricadas séries, estimativas causais, contas financeiras por rota aérea ou resultados por grupo.

A [metodologia](METODOLOGIA.md), o [catálogo](BASE_FONTES_OFICIAIS.md), o [dicionário](DICIONARIO_INDICADORES.md) e os limites de cada capítulo permitem identificar o alcance efetivamente entregue e o que ainda depende de pesquisa adicional.
