import { parseMarkdown, assignHeadingIds } from './content.mjs';

// Build-time only: the browser receives ready-to-read passages, not a Markdown parser.
export function extractPassages(markdown) {
  const tree = parseMarkdown(markdown);
  assignHeadingIds(tree);
  const definitions = new Map();
  const collectDefinitions = node => {
    if (node.type === 'definition') definitions.set(node.identifier, node.url);
    node.children?.forEach(collectDefinitions);
  };
  collectDefinitions(tree);
  const plain = node => {
    if (node.type === 'html' || node.type === 'image') return '';
    if (typeof node.value === 'string') return node.value;
    return (node.children || []).map(plain).join('');
  };
  const sources = node => {
    const links = new Map();
    const walk = child => {
      const url = child.type === 'link' ? child.url : child.type === 'linkReference' ? definitions.get(child.identifier) : null;
      if (url && /^https?:\/\//i.test(url)) links.set(url, { url, label: plain(child).trim() || 'Fonte citada' });
      child.children?.forEach(walk);
    };
    walk(node);
    return [...links.values()];
  };
  const passages = [];
  let section = '', anchor = '';
  const add = (node, text, kind = 'paragraph') => {
    text = text.replace(/\s+/g, ' ').trim();
    if (text.length < 40) return;
    passages.push({ section, anchor, text, kind, sources: sources(node) });
  };
  const visit = node => {
    if (node.type === 'heading') {
      // The reader's navigation exposes headings through level 3.
      if (node.depth <= 3) { section = plain(node); anchor = node.data.hProperties.id; }
    } else if (node.type === 'paragraph') {
      add(node, plain(node));
    } else if (node.type === 'table') {
      const [header, ...rows] = node.children;
      for (const row of rows) {
        const text = row.children.map((cell, i) => `${plain(header.children[i])}: ${plain(cell)}`).join(' · ');
        add(row, text, 'table');
      }
    } else if (node.type === 'list' || node.type === 'listItem') {
      node.children.forEach(visit);
    }
    // Code, raw HTML and editorial metadata blockquotes are deliberately excluded.
  };
  tree.children.forEach(visit);
  return passages;
}
