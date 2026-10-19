# Brasil Project: política, economia e desenvolvimento

> **Revisão editorial:** 19/10/2026.
> **Recorte da evidência:** estudos históricos com datas próprias; comparações macroeconômicas fechadas até 2025, sem projetar o restante de 2026.

Uma base de estudos sobre decisões públicas e suas consequências para a vida das pessoas. A linha de análise é: **o que aconteceu → qual evidência sustenta → quais mecanismos podem explicar → quem ganha, perde ou permanece excluído → o que ainda não sabemos**. O objetivo é permitir conclusões proporcionais à evidência e revisão por quem discorda.

## Como ler e conferir

Comece pela [metodologia editorial](METODOLOGIA.md), pelo [catálogo de fontes](BASE_FONTES_OFICIAIS.md) e pelo [dicionário de indicadores](DICIONARIO_INDICADORES.md). A [comparação entre governos](COMPARACOES_GOVERNOS.md) usa a mesma definição por indicador, informa períodos de transição e oferece arquivos e cálculo reproduzível.

Fato documentado, interpretação e hipótese devem aparecer diferenciados. Uma crítica pode ser sustentada sem acusar crime; investigação não equivale a condenação. Comparar resultados observados não identifica, sozinho, o efeito de um presidente. O projeto inclui fontes públicas, acadêmicas e privadas identificadas e não promete neutralidade automática ou checagem em tempo real.

## Estudos por tema

| Tema | Pergunta central |
|---|---|
| [Economia](economia/README.md) | Como inflação, trabalho, renda, crescimento e contas públicas evoluíram, e com quais limites de atribuição? |
| [Privatizações](economia/privatizacoes/README.md) | Como avaliar investimento, tarifas, governança e transferência de riscos? |
| [Corrupção e investigações](corrupcao_e_investigacoes/README.md) | O que cada caso documenta, em qual etapa e com qual alcance? |
| [Política e instituições](politica_e_instituicoes/README.md) | Como orçamento, coalizões e controle civil distribuem poder e responsabilidade? |
| [Sociedade e desenvolvimento](sociedade_e_desenvolvimento/README.md) | Como demografia, segurança e tributação afetam bem-estar e oportunidades? |
| [Geopolítica e energia](geopolitica_e_energia/README.md) | Quais são os ganhos, riscos e custos da inserção externa e das escolhas energéticas? |
| [Ideologia e discursos](ideologia_e_discursos/README.md) | Como confrontar discurso, conceito político e prática institucional sem rótulos automáticos? |
| [PECs e propostas](pecs_e_propostas/README.md) | O que é proposta, o que virou norma e quais efeitos dependem de implementação? |
| [Trabalho e leis trabalhistas](trabalho_e_leis_trabalhistas/README.md) | Como comparar proteção social, jornada e direitos sem misturar regimes diferentes? |
| [Economias internacionais](economias_internacionais/README.md) | O que a experiência argentina permite comparar e o que não permite transferir ao Brasil? |
| [Desenvolvimento humano e território](desenvolvimento_humano_e_territorio/README.md) | Como educação, saúde, moradia, desigualdades, clima e produtividade se conectam à vida cotidiana? |

## Aplicação e manutenção

O leitor usa React, TypeScript e Vite, com busca local e grafo de relações editoriais. Cada documento é baixado quando aberto. Busca, grafo, fórmulas e diagramas carregam sob demanda. O grafo representa conexões editoriais, sem demonstrar causalidade.

O botão **Consultar documentos**, no topo, abre o painel direito. Ele encontra até dois trechos integrais, com links para a seção, fontes citadas e recorte da evidência. A aba **Nesta página** mantém o sumário do documento. A consulta usa o índice local compartilhado com a pesquisa: não baixa modelo, não chama API de inferência e não envia a pergunta a um serviço externo. O histórico fica apenas na memória da sessão. Perguntas curtas de continuação podem retomar o tema anterior; a compreensão é por termos e relações predefinidas, sem geração de novas análises ou atualização das fontes. Uma resposta vazia indica falta de correspondência suficiente, não inexistência de evidência no mundo.

```bash
npm ci
npm run dev
npm test
npm run build
npm run preview
```

O build gera os metadados, os documentos individuais e o índice de busca a partir dos Markdown. Ele verifica tipos, metadados editoriais, links internos, âncoras e orçamento de carregamento inicial. `npm run check:content` pode ser executado separadamente. Essas verificações detectam regressões estruturais; a revisão factual continua humana e depende das fontes.

As comparações são regeneradas com `node scripts/build-comparisons.mjs`. Sua atualização exige rever os snapshots, o período e as conclusões. O [registro de verificação dos incrementos](VERIFICACAO_INCREMENTOS.md) descreve o que foi entregue, como foi testado e quais limitações permanecem.

## Efeitos distributivos

Os capítulos perguntam por diferenças entre grupos sociais e territórios, além do resultado agregado. Na ausência de dados compatíveis, a limitação é declarada. Isso evita tratar crescimento, superávit, redução de jornada ou mudança de propriedade como sinônimos automáticos de melhoria para todos.

## Conclusão e limites da evidência

A base permite comparar explicações e acompanhar evidências. Não substitui assessoria jurídica, pesquisa causal específica ou consulta atualizada de um processo. Pontos sem documentação suficiente devem ser corrigidos, retirados ou apresentados como pendências, com o mesmo critério para todos os governos e atores.
