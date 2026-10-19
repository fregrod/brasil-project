import MiniSearch from 'minisearch';
import { DocumentItem, SearchResult } from '../types';

let miniSearchInstance: MiniSearch<any> | null = null;
let documentsMap = new Map<string, DocumentItem>();

export function initSearch(docs: DocumentItem[]) {
  miniSearchInstance = new MiniSearch({
    fields: ['title', 'headingsText', 'category', 'plainText'],
    storeFields: ['id', 'title', 'category', 'path', 'excerpt'],
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,
      boost: {
        title: 4,
        headingsText: 2.5,
        category: 1.5,
        plainText: 1,
      },
    },
  });

  documentsMap.clear();

  const searchRecords = docs.map((doc) => {
    documentsMap.set(doc.id, doc);
    return {
      id: doc.id,
      title: doc.title,
      headingsText: doc.headings.map((h) => h.text).join(' '),
      category: doc.category,
      path: doc.path,
      excerpt: doc.excerpt,
      plainText: doc.plainText,
    };
  });

  miniSearchInstance.addAll(searchRecords);
}

function getHighlightedSnippet(fullText: string, query: string, length = 180): string {
  if (!query || !fullText) return '';
  const cleanQuery = query.toLowerCase().trim();
  const lowerText = fullText.toLowerCase();

  let index = lowerText.indexOf(cleanQuery);
  if (index === -1) {
    // try first word
    const words = cleanQuery.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      index = lowerText.indexOf(words[0]);
    }
  }

  if (index === -1) {
    return fullText.slice(0, length) + '...';
  }

  const start = Math.max(0, index - 50);
  const end = Math.min(fullText.length, index + cleanQuery.length + (length - 50));
  let snippet = fullText.slice(start, end).trim();

  if (start > 0) snippet = '...' + snippet;
  if (end < fullText.length) snippet = snippet + '...';

  return snippet;
}

export function searchContent(query: string, limit = 12): SearchResult[] {
  if (!miniSearchInstance || !query.trim()) {
    return [];
  }

  const rawResults = miniSearchInstance.search(query.trim());
  const results: SearchResult[] = [];

  for (const item of rawResults.slice(0, limit)) {
    const doc = documentsMap.get(item.id);
    if (!doc) continue;

    const snippet = getHighlightedSnippet(doc.plainText, query);

    results.push({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      path: doc.path,
      snippet,
      score: item.score,
      headings: doc.headings,
    });
  }

  return results;
}
