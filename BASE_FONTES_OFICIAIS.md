# Base Definitiva de Fontes Oficiais, Indicadores e Fatos Econômicos do Brasil

> **Repositório Central de Dados Oficiais**  
> **Objetivo:** Registrar e catalogar fontes primárias do Governo Federal, Banco Central, órgãos de pesquisa e organismos multilaterais para consulta de dados, checagem de fatos e análises macroeconômicas, sociais e fiscais.  
> **Última Atualização:** Outubro de 2026.

---

## 1. Visão Geral e Guia de Acesso a APIs Governamentais

O Brasil possui um dos sistemas estatísticos e orçamentários públicos mais transparentes e acessíveis do mundo. A maioria das séries temporais históricas pode ser consultada tanto por portais web quanto de forma automatizada por APIs públicas abertas (sem necessidade de chave de autenticação).

### Principais APIs Públicas Disponíveis:
1. **API SGS (Sistema Gerenciador de Séries Temporais) do Banco Central do Brasil:**
   * Endpoint base: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados?formato=json`
   * Retorna séries como Selic, Dívida Bruta (DBGG), Câmbio, Inflação acumulada, etc.
2. **API SIDRA do IBGE:**
   * Endpoint base: `https://apisidra.ibge.gov.br/values/t/{tabela}/v/{variavel}/p/{periodo}/n1/1`
   * Retorna IPCA, PNAD Contínua (desemprego, renda, informalidade), Contas Nacionais (PIB).
3. **Comex Stat (MDIC):**
   * Portal de extração granular e API de comércio exterior (exportações, importações, balança comercial).
4. **API Tesouro Transparente:**
   * Portal de dados abertos da Secretaria do Tesouro Nacional (gastos, receitas, previdência, precatórios).

---

## 2. Catálogo Setorial de Fontes e Indicadores

### Eixo I: Inflação e Custo de Vida (IBGE / BCB / FGV)

| Indicador / Conceito | Órgão Responsável | Sistema / Tabela Oficial | Código / Identificador | Link Oficial Direto | Metodologia e Escopo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IPCA - Variação Mensal e Acumulada** | IBGE (SNIPC) | SIDRA | Tabela 7060 / Tabela 1737 | [IBGE - IPCA](https://www.ibge.gov.br/estatisticas/economicas/precos-e-custos/9256-indice-nacional-de-precos-ao-consumidor-amplo.html) | Índice oficial de metas de inflação. Mede o consumo de famílias de 1 a 40 salários mínimos em 16 regiões metropolitanas/capitais. |
| **IPCA Acumulado 12 Meses** | Banco Central / IBGE | BCB SGS | Série SGS 13522 | [BCB SGS Séries](https://www3.bcb.gov.br/sgspub/localizarseries/pesquisaSeries.do) | Usado para monitorar o cumprimento das metas do Conselho Monetário Nacional (CMN). |
| **INPC (Índice Nacional de Preços ao Consumidor)** | IBGE (SNIPC) | SIDRA | Tabela 7063 | [IBGE - INPC](https://www.ibge.gov.br/estatisticas/economicas/precos-e-custos/9258-indice-nacional-de-precos-ao-consumidor.html) | Famílias com renda de 1 a 5 salários mínimos; serve de base para reajuste anual do Salário Mínimo e benefícios do INSS. |
| **IGP-M (Índice Geral de Preços - Mercado)** | FGV IBRE | FGV Dados / BCB | Série SGS 189 | [FGV IBRE](https://portalibre.fgv.br/) | Pondera preços no atacado (IPA - 60%), consumidor (IPC - 30%) e construção (INCC - 10%). Tradicional indexador imobiliário. |
| **Expectativas de Inflação (Boletim Focus)** | Banco Central do Brasil | Sistema de Expectativas de Mercado | Publicação semanal às segundas-feiras | [Boletim Focus](https://www.bcb.gov.br/publicacoes/focus) | Consolida projeções de mais de 140 instituições financeiras e consultorias econômicas para IPCA, Selic, PIB e Câmbio. |

---

### Eixo II: Mercado de Trabalho, Emprego e Renda (IBGE / MTE)

| Indicador / Conceito | Órgão Responsável | Sistema / Tabela Oficial | Código / Identificador | Link Oficial Direto | Metodologia e Escopo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Taxa de Desocupação (Desemprego)** | IBGE | PNAD Contínua (Trimestral/Mensal) | SIDRA Tabela 4099 / SGS 24369 | [IBGE - PNAD Contínua](https://www.ibge.gov.br/estatisticas/sociais/trabalho/9173-pesquisa-nacional-por-amostra-de-domicilios-continua-trimestral.html) | Percentual da força de trabalho que está sem ocupação e realizou busca ativa nas últimas 4 semanas. |
| **População Ocupada e Emprego Privado** | IBGE | PNAD Contínua | SIDRA Tabela 4093 / Tabela 4095 | [SIDRA Tabela 4093](https://sidra.ibge.gov.br/tabela/4093) | Número absoluto de pessoas ocupadas no país (com ou sem carteira, setor público e privado, por conta própria). |
| **Taxa de Subutilização da Força de Trabalho** | IBGE | PNAD Contínua | SIDRA Tabela 6433 | [SIDRA Tabela 6433](https://sidra.ibge.gov.br/tabela/6433) | Agrega os desocupados, os subocupados por insuficiência de horas trabalhadas e a força de trabalho potencial (desalentados). |
| **Taxa de Informalidade** | IBGE | PNAD Contínua | SIDRA Tabela 4097 | [SIDRA Tabela 4097](https://sidra.ibge.gov.br/tabela/4097) | Percentual de empregados sem carteira assinada, trabalhadores domésticos sem carteira e trabalhadores por conta própria sem CNPJ. |
| **Emprego Formal / Carteira Assinada** | Ministério do Trabalho e Emprego (MTE) | Novo CAGED (PDET) | Painel Mensal do CAGED | [Novo CAGED - MTE](http://pdet.mte.gov.br/novo-caged) | Registros administrativos obrigatórios via eSocial com saldo líquido (admissões menos demissões formais com CLT). |
| **Rendimento Médio Real Habitual** | IBGE | PNAD Contínua | SIDRA Tabela 5434 / Tabela 5436 | [SIDRA Tabela 5434](https://sidra.ibge.gov.br/tabela/5434) | Renda média mensal habitual de todos os trabalhos, deflacionada pelo IPCA para valores constantes. |
| **Salário Mínimo Vigente e Política Legal** | Presidência da República / MTE | Diário Oficial da União (DOU) | Lei nº 14.663/2023 / SGS 1619 | [Legislação Federal - Planalto](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14663.htm) | Política de valorização permanente: correção pelo INPC do ano anterior + variação percentual positiva do PIB de 2 anos antes. |

---

### Eixo III: Fome, Pobreza e Programas Sociais (FAO / IBGE / MDS)

| Indicador / Conceito | Órgão Responsável | Sistema / Tabela Oficial | Documento / Identificador | Link Oficial Direto | Metodologia e Escopo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mapa da Fome / Prevalência de Subalimentação** | FAO / ONU (com UNICEF, WFP, WHO, IFAD) | The State of Food Security and Nutrition in the World | Relatório SOFI Anual | [FAO SOFI Report](https://www.fao.org/publications/sofi/en/) | Se a taxa de subalimentação crônica ficar abaixo de 2,5% da população, o país sai do Mapa da Fome mundial. |
| **Insegurança Alimentar Domiciliar (EBIA)** | IBGE / MDS | PNAD Contínua / POF Especial | Escala Brasileira de Insegurança Alimentar | [IBGE - Módulo EBIA](https://www.ibge.gov.br/estatisticas/sociais/saude/28731-pesquisa-nacional-por-amostra-de-domicilios-continua-seguranca-alimentar.html) | Classifica os lares em: Segurança Alimentar, Insegurança Leve, Insegurança Moderada e Insegurança Grave (fome). |
| **Pobreza e Extrema Pobreza** | IBGE | Síntese de Indicadores Sociais (SIS) | Séries Históricas da SIS | [IBGE - SIS](https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html) | Utiliza os parâmetros do Banco Mundial: Pobreza (US$ 6,85/dia em paridade de poder de compra) e Extrema Pobreza (US$ 2,15/dia PPC). |
| **Bolsa Família e Cadastro Único (CadÚnico)** | MDS (Min. do Desenvolvimento Social) | Vis Social / SAGI | Painéis de Programas Sociais | [MDS SAGI - Painéis](https://aplicacoes.mds.gov.br/sagi/portal/) | Estatísticas de famílias atendidas, valores médios de repasse, condicionalidades de saúde e educação. |
| **BPC (Benefício de Prestação Continuada)** | MDS / INSS | LOAS (Lei 8.742/1993) | Boletim Estatístico da Previdência Social (BEPS) | [Previdência Social - Estatísticas](https://www.gov.br/previdencia/pt-br/assuntos/previdencia-social/estatisticas) | Benefício constitucional de um salário mínimo a idosos (65+ anos) e pessoas com deficiência de baixa renda per capita familiar (< 1/4 do mínimo). |

---

### Eixo IV: Política Monetária, Taxa Selic e Custo de Capital (Banco Central)

| Indicador / Conceito | Órgão Responsável | Sistema / Tabela Oficial | Código / Identificador | Link Oficial Direto | Metodologia e Escopo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Taxa Selic Meta** | Banco Central do Brasil | Copom | Série SGS 432 / Série SGS 1178 | [BCB - Taxa Selic](https://www.bcb.gov.br/controleinflacao/taxaselic) | Taxa básica de juros definida a cada 45 dias pelo Copom para ancorar o custo de liquidez bancária. |
| **Atas e Relatórios do Copom** | Banco Central do Brasil | Comitê de Política Monetária | Publicação pós-reunião | [Atas do Copom](https://www.bcb.gov.br/publicacoes/atascopom) | Registro das justificativas técnicas para elevação, manutenção ou corte dos juros. |
| **Juro Real Ex-Ante e Ranking Global** | Banco Central / Instituições Financeiras | MoneYou / Infinity Asset / BCB | Monitor de Juros Reais | [BCB - Relatório de Inflação](https://www.bcb.gov.br/publicacoes/ri) | Juro nominal descontado da projeção de inflação para os próximos 12 meses (consistente com o Focus). |
| **Taxa de Juros Médias de Crédito (SFN)** | Banco Central do Brasil | Estatísticas Monetárias e de Crédito | Séries SGS 20714 (Rotativo Cartão), SGS 20715 (Cheque Especial) | [BCB - Notas para a Imprensa: Crédito](https://www.bcb.gov.br/estatisticas/estatisticasmonetariascredito) | Custo efetivo médio cobrado por bancos a famílias e empresas (spread e juros livres). |

---

### Eixo V: Finanças Públicas, Dívida e Política Fiscal (Tesouro Nacional / BCB)

| Indicador / Conceito | Órgão Responsável | Sistema / Tabela Oficial | Código / Identificador | Link Oficial Direto | Metodologia e Escopo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dívida Bruta do Governo Geral (DBGG)** | Banco Central do Brasil / Tesouro | Estatísticas Fiscais | Série SGS 4505 (% do PIB) | [BCB - Séries Fiscais](https://www.bcb.gov.br/estatisticas/estatisticasfiscais) | Abrange o governo federal, governos estaduais, municipais e INSS (exclui BCB e estatais). Métrica primária de solvência internacional. |
| **Resultado Primário do Governo Central** | Secretaria do Tesouro Nacional (STN) | RTN Mensal | Painel do Resultado do Tesouro Nacional | [Tesouro Nacional - RTN](https://www.gov.br/tesouronacional/pt-br/estatisticas-fiscais-e-planejamento/resultado-do-tesouro-nacional-rtn) | Diferença entre receitas líquidas e despesas totais do Governo Federal (excluindo despesas com juros da dívida). |
| **Novo Arcabouço Fiscal** | Ministério da Fazenda / Congresso | Lei Complementar nº 200/2023 | Legislação Federal | [Planalto - LC 200/2023](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp200.htm) | Limita o crescimento real da despesa pública a 70% da variação da receita primária (com teto de 2,5% e piso de 0,6% a.a.) e bandas de resultado primário. |
| **Relatórios de Avaliação Fiscal (RAF)** | Instituição Fiscal Independente (IFI / Senado) | Relatório Técnico do Senado Federal | RAF Mensal | [IFI - Senado Federal](https://www12.senado.leg.br/ifi) | Órgão técnico autônomo do Senado que projeta cenários de dívida pública, déficit e cumprimento de metas fiscais. |
| **Portal de Transparência Fiscal** | Secretaria do Tesouro Nacional | Tesouro Transparente | Painel Interativo | [Tesouro Transparente](https://www.tesourotransparente.gov.br/) | Consulta de estoque de títulos da dívida, custos de emissão, precatórios, transferências a estados e municípios. |

---

### Eixo VI: Tributação e Arrecadação (Receita Federal / Fazenda)

| Indicador / Conceito | Órgão Responsável | Sistema / Publicação | Documento / Identificador | Link Oficial Direto | Metodologia e Escopo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Carga Tributária Bruta (% do PIB)** | Receita Federal do Brasil (CETAD) | Relatório Anual da Carga Tributária | Estudo da Carga Tributária Bruta | [Receita Federal - Carga Tributária](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/estudos/carga-tributaria) | Relação percentual entre a arrecadação de todos os tributos (União, Estados e Municípios) e o PIB nominal do país. |
| **Arrecadação Mensal das Receitas Federais** | Receita Federal do Brasil | Relatório de Arrecadação | Coletiva Mensal RFB | [Receita Federal - Arrecadação](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/relatorios/arrecadacao) | Detalhamento de IRPF, IRPJ, CSLL, PIS/Pasep, Cofins, IPI, Cide e receitas previdenciárias. |
| **Reforma Tributária (EC 132/2023)** | Congresso Nacional / Ministério da Fazenda | Constituição Federal | Emenda Constitucional nº 132/2023 | [Planalto - EC 132/2023](https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc132.htm) | Unifica 5 tributos sobre o consumo em IVA Dual: CBS (Federal) e IBS (Estados e Municípios), com Imposto Seletivo (IS). |
| **Alíquota Padrão Estimada do IVA Dual** | Ministério da Fazenda | Notas Técnicas da Reforma Tributária | Nota Técnica MF nº 34/2024 / PLP 68/2024 | [Ministério da Fazenda - Reforma](https://www.gov.br/fazenda/pt-br/assuntos/reforma-tributaria) | Projeção técnica da alíquota necessária para manter a neutralidade arrecadatória (estimada entre 26,5% e 27,97%). |

---

### Eixo VII: Comércio Exterior, Agronegócio e Atividade Produtiva (MDIC / CONAB / IBGE)

| Indicador / Conceito | Órgão Responsável | Sistema / Tabela Oficial | Identificador / Painel | Link Oficial Direto | Metodologia e Escopo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Balança Comercial Brasileira** | MDIC / SECEX | Comex Stat | Sistema de Estatísticas de Comércio Exterior | [Comex Stat - MDIC](https://comexstat.mdic.gov.br/) | Registros oficiais aduaneiros (Siscomex) com volume e valor de exportações, importações e saldo comercial por produto e destino. |
| **Safras de Grãos e Agropecuária** | CONAB (Min. da Agricultura) | Levantamento de Safras | Relatório Mensal de Grãos | [CONAB - Safras](https://www.conab.gov.br/info-agro/safras/graos) | Monitoramento de área plantada, produtividade e produção total de soja, milho, arroz, trigo e café no país. |
| **Contas Nacionais Trimestrais (PIB)** | IBGE | Sistema de Contas Nacionais | SIDRA Tabela 1846 / Tabela 6612 | [IBGE - PIB Trimestral](https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais/9300-contas-nacionais-trimestrais.html) | PIB sob a ótica da produção (Agro, Indústria, Serviços) e da demanda (Consumo das Famílias, Governo, FBCF e Exportações Líquidas). |
| **Comparações Globais de PIB e Renda** | FMI (Fundo Monetário Internacional) | World Economic Outlook (WEO) | WEO Database | [FMI - WEO Database](https://www.imf.org/en/Publications/WEO) | Estatísticas comparativas de crescimento real do PIB per capita entre economias avançadas e emergentes. |

---

### Eixo VIII: Crédito Privado, Inadimplência, Empresas e Mercado de Capitais (Serasa / B3 / CVM)

| Indicador / Conceito | Instituição | Sistema / Publicação | Identificador | Link Direto | Metodologia e Escopo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mapa da Inadimplência do Consumidor** | Serasa Experian | Indicador Mensal de Inadimplência | Relatório de Inadimplência PF | [Serasa - Mapa da Inadimplência](https://www.serasaconsexperian.com.br/amplie-seus-conhecimentos/indicadores-economicos/) | Quantidade de CPFs negativados no Brasil, volume de dívidas vencidas e distribuição por faixa de idade e renda. |
| **Falências e Recuperações Judiciais** | Serasa Experian | Indicador de Falências e RJs | Estatística Mensal | [Serasa - Falências e RJs](https://www.serasaconsexperian.com.br/amplie-seus-conhecimentos/indicadores-economicos/) | Registro mensal de pedidos e concessões de recuperação judicial e falência deferidas por tribunais em todo o país. |
| **IPOs e Ofertas Públicas de Ações** | B3 / CVM | Estatísticas de Mercado da B3 | Relatórios de Ofertas Públicas | [B3 - Ofertas Públicas](https://www.b3.com.br/pt_br/produtos-e-servicos/solucoes-para-emissores/ofertas-publicas/estatisticas/) | Histórico de emissões primárias (novas empresas na bolsa) e secundárias de ações e debêntures corporativas. |
| **Indústrias sob Regime de Maquila (Paraguai)** | CNIME (Min. da Indústria do Paraguai) | Relatórios Oficiais de Comércio Exterior | Lei de Maquila nº 1064/1997 | [Ministério de Indústria do Paraguai](https://www.mic.gov.py/) | Monitoramento oficial de empresas estrangeiras (principalmente brasileiras) instaladas no Paraguai para exportação com isenções fiscais. |

---

### Eixo IX: Educação e Avaliação Internacional (OCDE / INEP)

| Indicador / Conceito | Órgão Responsável | Sistema / Relatório | Edição / Base | Link Oficial Direto | Metodologia e Escopo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PISA (Programa Internacional de Avaliação de Estudantes)** | OCDE (com aplicação pelo INEP no Brasil) | Relatório PISA Internacional | Edições 2018, 2022, 2025 | [OCDE PISA](https://www.oecd.org/pisa/) / [INEP - PISA](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/pisa) | Avaliação padronizada aplicada a estudantes de 15 anos em quase 90 países nas áreas de Leitura, Matemática e Ciências. |

---

## 3. Scripts Utilitários para Coleta Direta das Fontes

Para garantir a reprodutibilidade dos dados sem intervenção manual, utilize os scripts em Python abaixo para consultar dados oficiais diretamente dos servidores públicos.

### Script A: Coleta de Séries do Banco Central do Brasil (API SGS)

```python
import urllib.request
import json
import pandas as pd

def obter_serie_bcb(codigo_serie):
    """
    Obtém série histórica oficial do SGS/BCB em formato JSON.
    Exemplos de códigos:
      - 432: Taxa Selic Meta
      - 13522: IPCA acumulado em 12 meses
      - 4505: Dívida Bruta do Governo Geral (% do PIB)
      - 24369: Taxa de desocupação (PNADC)
    """
    url = f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo_serie}/dados?formato=json"
    headers = {"User-Agent": "ConsultaEstatistica/1.0"}
    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req) as resp:
        dados = json.loads(resp.read().decode('utf-8'))
        
    df = pd.DataFrame(dados)
    df['data'] = pd.to_datetime(df['data'], format='%d/%m/%Y')
    df['valor'] = pd.to_numeric(df['valor'])
    return df

# Exemplo: Consultar os últimos 12 meses de Dívida Bruta e Selic
# df_divida = obter_serie_bcb(4505)
# print(df_divida.tail(12))
```

### Script B: Coleta de Inflação e Emprego do IBGE (API SIDRA)

```python
import urllib.request
import json

def obter_ipca_sidra():
    """
    Consulta a variação acumulada em 12 meses do IPCA na Tabela 7060 do SIDRA.
    """
    # Tabela 7060, Variável 2265 (IPCA acumulado em 12 meses), Brasil (n1/1), últimos 12 meses
    url = "https://apisidra.ibge.gov.br/values/t/7060/v/2265/p/last%2012/n1/1"
    headers = {"User-Agent": "ConsultaEstatistica/1.0"}
    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req) as resp:
        dados = json.loads(resp.read().decode('utf-8'))
        
    # Primeiro elemento é o cabeçalho descritivo
    for item in dados[1:]:
        mes = item.get('D3N')  # Nome do mês
        valor = item.get('V')   # Valor numérico
        print(f"Mês: {mes} | IPCA 12m: {valor}%")

# obter_ipca_sidra()
```

---

## 4. Glossário de Conceitos Técnicos Essenciais

1. **DBGG (Dívida Bruta do Governo Geral):** Conceito utilizado por agências de classificação de risco (Fitch, S&P, Moody's) e organismos internacionais como o FMI. Representa o total dos passivos do Governo Federal, INSS e governos subnacionais.
2. **Resultado Primário:** O saldo das receitas menos as despesas do setor público antes do pagamento dos juros nominais da dívida pública. Superávit primário indica que o governo economizou para pagar parte dos juros; déficit primário significa que o governo tomou novos empréstimos para cobrir até as despesas ordinárias.
3. **Taxa Composta de Subutilização:** Métrica do IBGE que vai além da taxa de desemprego convencional, mensurando também os trabalhadores que gostariam de trabalhar mais horas e os que desistiram de procurar emprego por crerem que não encontrariam (desalentados).
4. **Carga Tributária Bruta:** A soma de todos os impostos, contribuições e taxas arrecadados pelos entes federativos dividida pelo Produto Interno Bruto (PIB) do mesmo ano.
5. **IVA Dual (CBS e IBS):** Modelo instituído pela Reforma Tributária (EC 132/2023) com tributação no destino (onde a mercadoria ou serviço é consumido), com alíquota uniforme, fim da cumulatividade e crédito financeiro amplo.
