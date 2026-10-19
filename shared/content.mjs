import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export function slugify(text) {
  return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || 'secao';
}

// Currency is prose, including when several amounts occur in one paragraph.
// Preserve fenced and inline code verbatim.
export function normalizeMarkdown(markdown) {
  let fence = null;
  return markdown.split('\n').map((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
      return line;
    }
    if (fence) return line;
    return line.split(/(`+[^`]*`+)/g).map((part, index) => index % 2 ? part :
      part.replace(/(?<!\\)\b(R|US|ARS|AR|C|A|NZ|HK|S|U)\$/g, '$1\\$')).join('');
  }).join('\n');
}

function textContent(node) {
  if (typeof node.value === 'string') return node.value;
  return (node.children || []).map(textContent).join('');
}

export function assignHeadingIds(tree) {
  const used = new Set();
  const headings = [];
  function visit(node) {
    if (node.type === 'heading') {
      const text = textContent(node).trim();
      const base = slugify(text);
      let id = base, count = 0;
      while (used.has(id)) id = `${base}-${++count}`;
      used.add(id);
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
      if (node.depth <= 3) headings.push({ level: node.depth, text, id });
    }
    (node.children || []).forEach(visit);
  }
  visit(tree);
  return headings;
}

export function remarkHeadingIds() {
  return (tree) => { assignHeadingIds(tree); };
}

export function parseMarkdown(markdown) {
  return unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(normalizeMarkdown(markdown));
}

export function extractHeadings(markdown) {
  return assignHeadingIds(parseMarkdown(markdown));
}

export function extractLinks(markdown) {
  const tree = parseMarkdown(markdown);
  const definitions = new Map();
  const result = [];
  function collect(node) {
    if (node.type === 'definition') definitions.set(node.identifier, node.url);
    (node.children || []).forEach(collect);
  }
  collect(tree);
  function visit(node) {
    const url = node.type === 'link' ? node.url : node.type === 'linkReference' ? definitions.get(node.identifier) : null;
    if (url) result.push({ url, label: textContent(node), line: node.position?.start.line });
    (node.children || []).forEach(visit);
  }
  visit(tree);
  return result;
}

export function resolveDocumentLink(currentPath, href) {
  if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//')) return null;
  const [file, ...anchorParts] = href.split('#');
  let decoded;
  try { decoded = decodeURIComponent(file); } catch { return null; }
  const parts = decoded.startsWith('/') ? [] : currentPath.split('/').slice(0, -1);
  for (const part of decoded.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!parts.length) return null; parts.pop(); }
    else parts.push(part);
  }
  return { path: file ? parts.join('/') : currentPath, anchor: anchorParts.join('#') };
}
