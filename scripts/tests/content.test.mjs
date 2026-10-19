import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMarkdown, extractHeadings, resolveDocumentLink, parseMarkdown } from '../../shared/content.mjs';

test('amounts remain prose and mathematical expressions remain math', () => {
  const tree = parseMarkdown('Custo R$ 90 bi e receita R$ 41 bi; US$ 2 bi. Fórmula $x + y$.');
  const nodes = tree.children[0].children;
  assert.equal(nodes.filter(n => n.type === 'inlineMath').length, 1);
  assert.equal(nodes.find(n => n.type === 'inlineMath').value, 'x + y');
  assert.match(nodes[0].value, /R\$ 90 bi e receita R\$ 41 bi/);
});
test('code is preserved and normalization is idempotent', () => {
  const md = 'R$ 10 e `R$ 20`\n```python\na = "R$ 30"\n```';
  const normalized = normalizeMarkdown(md);
  assert.match(normalized, /`R\$ 20`/);
  assert.match(normalized, /a = "R\$ 30"/);
  assert.equal(normalizeMarkdown(normalized), normalized);
});
test('formatted and repeated headings have the same stable identifiers', () => {
  const headings = extractHeadings('## **Seção** com [`código`](a.md)\n## Repetida\n## Repetida\n```\n## Não é título\n```');
  assert.deepEqual(headings.map(h => h.id), ['secao-com-codigo', 'repetida', 'repetida-1']);
});
test('document links handle anchors and reject remote or escaping paths', () => {
  assert.deepEqual(resolveDocumentLink('economia/a.md', '../README.md#fontes'), { path: 'README.md', anchor: 'fontes' });
  assert.deepEqual(resolveDocumentLink('economia/a.md', '#fontes'), { path: 'economia/a.md', anchor: 'fontes' });
  assert.equal(resolveDocumentLink('a.md', '../secret.md'), null);
  assert.equal(resolveDocumentLink('a.md', 'https://example.com/a.md'), null);
});
test('heading suffixes cannot collide with an existing literal suffix', () => {
  const headings = extractHeadings('## Teste\n## Teste\n## Teste-1\n## Teste');
  assert.equal(new Set(headings.map(h => h.id)).size, headings.length);
});
