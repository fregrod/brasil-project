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

  const outDir = path.join(rootDir, 'src', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outDir, 'content.json'), JSON.stringify(documents, null, 2), 'utf-8');
  fs.writeFileSync(path.join(outDir, 'categories.json'), JSON.stringify(categoryList, null, 2), 'utf-8');

  console.log(`[build-content] Processed ${documents.length} markdown documents across ${categoryList.length} categories.`);
}

run();
