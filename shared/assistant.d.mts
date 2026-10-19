export interface Passage {
  section: string; anchor: string; text: string; kind: 'paragraph' | 'table';
  sources: { url: string; label: string }[];
}
export interface AssistantDocument {
  path: string; title: string; category: string; evidencePeriod: string;
  isIndex?: boolean; passages: Passage[];
}
export interface AnswerPassage extends Passage {
  path: string; title: string; category: string; evidencePeriod: string; score: number; words: number;
}
export interface DocumentAnswer {
  found: boolean; message: string; contextUsed: boolean; passages: AnswerPassage[];
  pages: { path: string; title: string; anchor: string }[];
}
export function normalize(text: string): string;
export function questionTerms(question: string): string[];
export function prepareQuestion(question: string, previousQuestion?: string): { terms: string[]; entities: string[]; contextUsed: boolean; searchQuery: string };
export function selectAnswer(question: string, documents: AssistantDocument[], previousQuestion?: string): DocumentAnswer;
