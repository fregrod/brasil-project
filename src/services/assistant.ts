import { ensureSearchLoaded } from './search';
import { prepareQuestion, selectAnswer, type AssistantDocument, type DocumentAnswer } from '../../shared/assistant.mjs';

export async function askDocuments(question: string, previousQuestion = ''): Promise<DocumentAnswer> {
  const prepared = prepareQuestion(question, previousQuestion);
  if (!prepared.terms.length) return selectAnswer(question, [], previousQuestion);
  const index = await ensureSearchLoaded();
  const matches = index.search(prepared.searchQuery, { prefix: true, fuzzy: false, combineWith: 'OR' });
  return selectAnswer(question, matches as unknown as AssistantDocument[], previousQuestion);
}
