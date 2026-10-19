import MiniSearch from 'minisearch';
import searchManifest from '../data/search.json';
import { searchOptions } from '../../shared/search.mjs';
import type { SearchResult } from '../types';

let indexPromise: Promise<MiniSearch> | null = null;
export const documentCount = searchManifest.count;

export function ensureSearchLoaded(): Promise<MiniSearch> {
  if (!indexPromise) {
    indexPromise = fetch(`${import.meta.env.BASE_URL}${searchManifest.url.replace(/^\//, '')}`)
      .then(async response => {
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Não foi possível carregar o índice de pesquisa.');
        return MiniSearch.loadJSON(await response.text(), searchOptions);
      }).catch(error => { indexPromise = null; throw error; });
  }
  return indexPromise;
}

export async function searchContent(query: string, limit = 12): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const index = await ensureSearchLoaded();
  return index.search(query.trim()).slice(0, limit).map(item => {
    const fullText = (item.passages as { text: string }[] | undefined)?.map(passage => passage.text).join(' ') || '';
    const position = fullText.toLocaleLowerCase('pt-BR').indexOf(query.toLocaleLowerCase('pt-BR').trim());
    const start = Math.max(0, position - 50);
    return { id: String(item.id), title: item.title, category: item.category, path: item.path,
      snippet: `${start ? '…' : ''}${fullText.slice(start, start + 180)}…`, score: item.score, headings: [] };
  });
}
