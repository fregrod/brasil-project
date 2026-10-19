import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CATEGORY_MAP = {
  '': { name: 'Visão Geral & Fontes', order: 1, icon: 'Compass' },
  'economia': { name: 'Macroeconomia', order: 2, icon: 'TrendingUp' },
  'economia/privatizacoes': { name: 'Privatizações & Concessões', order: 3, icon: 'Building2' },
  'corrupcao_e_investigacoes': { name: 'Corrupção & Operações Judiciais', order: 4, icon: 'Scale' },
  'politica_e_instituicoes': { name: 'Política & Instituições', order: 5, icon: 'Landmark' },
  'pecs_e_propostas': { name: 'PECs & Marcos Fiscais', order: 6, icon: 'ScrollText' },
  'sociedade_e_desenvolvimento': { name: 'Sociedade & Indicadores', order: 7, icon: 'Users' },
  'trabalho_e_leis_trabalhistas': { name: 'Trabalho & Previdência', order: 8, icon: 'Briefcase' },
  'geopolitica_e_energia': { name: 'Geopolítica & Soberania', order: 9, icon: 'Globe' },
  'ideologia_e_discursos': { name: 'Ideologia & Discursos', order: 10, icon: 'MessageSquareText' },
  'economias_internacionais': { name: 'Economias Internacionais', order: 11, icon: 'BarChart3' },
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function extractHeadings(markdown) {
  const headings = [];
  const lines = markdown.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      let text = match[2].trim();
      // clean markdown links inside headings like [# text](link)
      text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*_]/g, '');
      const id = slugify(text);
      headings.push({ level, text, id });
    }
  }
  return headings;
}

function cleanPlainText(markdown) {
  return markdown
    // Remove mermaid code blocks
    .replace(/```mermaid[\s\S]*?```/g, ' ')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, ' ')
    // Remove inline code
    .replace(/`[^`]+`/g, ' ')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove markdown links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Remove blockquotes and headers markers
    .replace(/^[>#\s+-]+/gm, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirstParagraph(markdown) {
  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith('#') &&
      !trimmed.startsWith('```') &&
      !trimmed.startsWith('---') &&
      !trimmed.startsWith('|') &&
      !trimmed.startsWith('>')
    ) {
      return trimmed.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*_]/g, '');
    }
  }
  return '';
}

function getAllMarkdownFiles(dir, fileList = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.name.startsWith('.') || item.name === 'node_modules' || item.name === 'dist') {
      continue;
    }
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      getAllMarkdownFiles(fullPath, fileList);
    } else if (item.isFile() && item.name.endsWith('.md')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function run() {
  const mdFiles = getAllMarkdownFiles(rootDir);
  const documents = [];

  for (const filePath of mdFiles) {
    const relPath = path.relative(rootDir, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');

    const dirName = path.dirname(relPath) === '.' ? '' : path.dirname(relPath);
    const fileName = path.basename(relPath);

    // Extract title
    const headings = extractHeadings(content);
    let title = headings.find((h) => h.level === 1)?.text;
    if (!title) {
      title = fileName.replace(/\.md$/, '').replace(/^[0-9]+_/, '').replace(/_/g, ' ');
    }

    const plainText = cleanPlainText(content);
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const categoryInfo = CATEGORY_MAP[dirName] || {
      name: dirName ? dirName.replace(/_/g, ' ').toUpperCase() : 'Geral',
      order: 99,
      icon: 'Folder',
    };

    // Calculate sort order within category
    let itemOrder = 100;
    if (fileName === 'README.md') {
      itemOrder = 0;
    } else if (fileName === 'BASE_FONTES_OFICIAIS.md') {
      itemOrder = 1;
    } else {
      const match = fileName.match(/^(\d+)_/);
      if (match) {
        itemOrder = parseInt(match[1], 10) + 1;
      }
    }

    documents.push({
      id: relPath, // Unique identifier e.g. "economia/01_governo_lula_3_analise_economica.md"
      path: relPath,
      fileName,
      dirName,
      title,
      category: categoryInfo.name,
      categoryKey: dirName,
      categoryOrder: categoryInfo.order,
      categoryIcon: categoryInfo.icon,
      itemOrder,
      headings,
      excerpt: extractFirstParagraph(content).slice(0, 240),
      wordCount,
      readTimeMinutes,
      plainText,
      rawContent: content,
    });
  }

  // Sort documents: categoryOrder ASC, itemOrder ASC, title ASC
  documents.sort((a, b) => {
    if (a.categoryOrder !== b.categoryOrder) {
      return a.categoryOrder - b.categoryOrder;
    }
    if (a.itemOrder !== b.itemOrder) {
      return a.itemOrder - b.itemOrder;
    }
    return a.title.localeCompare(b.title);
  });

  // Group by categories
  const categories = {};
  for (const doc of documents) {
    if (!categories[doc.categoryKey]) {
      categories[doc.categoryKey] = {
        key: doc.categoryKey,
        name: doc.category,
        order: doc.categoryOrder,
        icon: doc.categoryIcon,
        documents: [],
      };
    }
    categories[doc.categoryKey].documents.push({
      id: doc.id,
      path: doc.path,
      title: doc.title,
      fileName: doc.fileName,
      readTimeMinutes: doc.readTimeMinutes,
      itemOrder: doc.itemOrder,
      headingsCount: doc.headings.length,
    });
  }

  const categoryList = Object.values(categories).sort((a, b) => a.order - b.order);

  // Build Obsidian-style Knowledge Graph
  const CATEGORY_COLORS = {
    '': '#A1A1AA',
    'economia': '#10B981',
    'economia/privatizacoes': '#06B6D4',
    'corrupcao_e_investigacoes': '#F43F5E',
    'politica_e_instituicoes': '#F59E0B',
    'pecs_e_propostas': '#8B5CF6',
    'sociedade_e_desenvolvimento': '#3B82F6',
    'trabalho_e_leis_trabalhistas': '#EC4899',
    'geopolitica_e_energia': '#14B8A6',
    'ideologia_e_discursos': '#E11D48',
    'economias_internacionais': '#6366F1',
  };

  const docPaths = new Set(documents.map((d) => d.path));
  const nodes = documents.map((doc) => {
    const isRoot = doc.path === 'README.md';
    const isCategoryHub = doc.fileName === 'README.md';
    let nodeSize = 6;
    if (isRoot) nodeSize = 14;
    else if (isCategoryHub) nodeSize = 10;
    else nodeSize = Math.max(5, Math.min(9, Math.round(doc.wordCount / 350)));

    return {
      id: doc.path,
      title: doc.title,
      category: doc.category,
      categoryKey: doc.categoryKey,
      categoryOrder: doc.categoryOrder,
      color: CATEGORY_COLORS[doc.categoryKey] || '#A1A1AA',
      wordCount: doc.wordCount,
      readTimeMinutes: doc.readTimeMinutes,
      isHub: isCategoryHub || isRoot,
      size: nodeSize,
    };
  });

  const edgeSet = new Set();
  const edges = [];

  function addEdge(source, target, type) {
    if (!source || !target || source === target) return;
    if (!docPaths.has(source) || !docPaths.has(target)) return;
    const key = [source, target].sort().join('<->');
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ source, target, type });
    }
  }

  // 1. Connect category files to their category README.md
  for (const doc of documents) {
    if (doc.dirName) {
      const categoryReadme = `${doc.dirName}/README.md`;
      if (docPaths.has(categoryReadme) && doc.path !== categoryReadme) {
        addEdge(doc.path, categoryReadme, 'category');
      }
    }
    // Connect category hubs to root README.md
    if (doc.fileName === 'README.md' && doc.path !== 'README.md') {
      addEdge(doc.path, 'README.md', 'hub');
    }
    if (doc.path === 'BASE_FONTES_OFICIAIS.md') {
      addEdge(doc.path, 'README.md', 'hub');
    }
  }

  // 2. Extract explicit markdown links inside content
  for (const doc of documents) {
    const linkMatches = [...doc.rawContent.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
    for (const match of linkMatches) {
      const rawHref = match[2];
      if (!rawHref.includes('.md')) continue;

      let cleanTarget = rawHref.split('#')[0];
      // strip file:///.../brasil-project/
      cleanTarget = cleanTarget.replace(/file:\/\/\/.*?\/brasil-project\//, '');

      // resolve relative path
      const pathParts = doc.path.split('/');
      pathParts.pop();
      const hrefParts = cleanTarget.split('/');
      for (const seg of hrefParts) {
        if (seg === '.' || seg === '') continue;
        if (seg === '..') {
          if (pathParts.length > 0) pathParts.pop();
        } else {
          pathParts.push(seg);
        }
      }
      const resolved = pathParts.join('/');
      if (docPaths.has(resolved)) {
        addEdge(doc.path, resolved, 'explicit');
      }
    }
  }

  // 3. Thematic cross-cutting edges
  const THEMATIC_TOPICS = [
    {
      docs: [
        'economia/01_governo_lula_3_analise_economica.md',
        'economia/04_governos_lula_1_2_e_dilma_analise_economica.md',
        'corrupcao_e_investigacoes/01_operacao_lava_jato_e_petrolao.md',
        'corrupcao_e_investigacoes/08_escandalos_bndes_operacoes_e_vinculos_lula.md',
        'ideologia_e_discursos/01_lula_discursos_e_conexoes_comunistas.md',
        'geopolitica_e_energia/03_soberania_nacional_lula_analise_fatos_e_decisoes.md',
      ],
    },
    {
      docs: [
        'economia/02_governo_bolsonaro_analise_economica.md',
        'corrupcao_e_investigacoes/02_governo_bolsonaro_e_investigacoes.md',
        'ideologia_e_discursos/02_bolsonaro_discursos_e_conexoes_fascistas_autoritarias.md',
        'geopolitica_e_energia/04_soberania_nacional_bolsonaro_analise_fatos_e_decisoes.md',
      ],
    },
    {
      docs: [
        'economia/03_governo_temer_analise_economica.md',
        'corrupcao_e_investigacoes/03_governo_temer_e_mdb.md',
      ],
    },
    {
      docs: [
        'corrupcao_e_investigacoes/05_centrao_orcamento_secreto_e_codevasf.md',
        'politica_e_instituicoes/01_presidencialismo_de_coalizao_e_orcamento_impositivo.md',
        'pecs_e_propostas/02_linha_historica_teto_orcamento_secreto_arcabouco.md',
      ],
    },
    {
      docs: [
        'trabalho_e_leis_trabalhistas/01_escandalo_inss_fraudes_descontos_associativos_e_investigacoes.md',
        'sociedade_e_desenvolvimento/01_demografia_previdencia_e_produtividade.md',
      ],
    },
    {
      docs: [
        'pecs_e_propostas/01_pec_fim_escala_6x1_jornada_trabalho.md',
        'trabalho_e_leis_trabalhistas/02_comparativo_leis_trabalhistas_brasil_vs_top25_mundo.md',
      ],
    },
    {
      docs: [
        'economia/privatizacoes/01_privatizacao_eletrobras_processo_indicadores_corrupcao_e_impactos.md',
        'geopolitica_e_energia/01_transicao_energetica_agro_e_margem_equatorial.md',
      ],
    },
    {
      docs: [
        'corrupcao_e_investigacoes/07_stf_casos_historicos_e_conexoes.md',
        'corrupcao_e_investigacoes/04_acao_penal_470_mensalao.md',
        'corrupcao_e_investigacoes/06_casos_em_aberto_e_instabilidades_recentes.md',
        'ideologia_e_discursos/04_lula_e_aliados_casos_autoritarios_instituicoes_imprensa.md',
      ],
    },
    {
      docs: [
        'economias_internacionais/01_argentina_analise_economica_pre_e_pos_milei.md',
        'geopolitica_e_energia/02_politica_externa_brics_e_desdolarizacao.md',
        'economia/06_cenario_global_crises_e_impactos_no_brasil.md',
      ],
    },
  ];

  for (const topic of THEMATIC_TOPICS) {
    for (let i = 0; i < topic.docs.length; i++) {
      for (let j = i + 1; j < topic.docs.length; j++) {
        addEdge(topic.docs[i], topic.docs[j], 'thematic');
      }
    }
  }

  const outDir = path.join(rootDir, 'src', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const graphData = { nodes, edges };

  fs.writeFileSync(path.join(outDir, 'content.json'), JSON.stringify(documents, null, 2), 'utf-8');
  fs.writeFileSync(path.join(outDir, 'categories.json'), JSON.stringify(categoryList, null, 2), 'utf-8');
  fs.writeFileSync(path.join(outDir, 'graph.json'), JSON.stringify(graphData, null, 2), 'utf-8');

  console.log(`[build-content] Processed ${documents.length} markdown documents, ${categoryList.length} categories, and ${edges.length} graph edges.`);
}

run();
