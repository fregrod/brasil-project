import type { DocumentMetadata } from '../types';
const cache = new Map<string, string>();
export async function loadDocument(doc: DocumentMetadata, signal?: AbortSignal): Promise<string> {
  if (cache.has(doc.contentHash)) return cache.get(doc.contentHash)!;
  const response = await fetch(`${import.meta.env.BASE_URL}${doc.contentUrl.replace(/^\//, '')}`, { signal });
  if (!response.ok) throw new Error('Não foi possível carregar este documento.');
  const type = response.headers.get('content-type') || '';
  if (!type.includes('application/json')) throw new Error('Esta versão do documento não está disponível. Atualize a página para obter o acervo atual.');
  const data = await response.json();
  if (typeof data.rawContent !== 'string') throw new Error('O documento recebido é inválido.');
  cache.set(doc.contentHash, data.rawContent);
  return data.rawContent;
}
