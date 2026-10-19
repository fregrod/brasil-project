export interface Heading {
  level: number;
  text: string;
  id: string;
}

export interface DocumentItem {
  id: string;
  path: string;
  fileName: string;
  dirName: string;
  title: string;
  category: string;
  categoryKey: string;
  categoryOrder: number;
  categoryIcon: string;
  itemOrder: number;
  headings: Heading[];
  excerpt: string;
  wordCount: number;
  readTimeMinutes: number;
  plainText: string;
  rawContent: string;
}

export interface CategorySummary {
  id: string;
  path: string;
  title: string;
  fileName: string;
  readTimeMinutes: number;
  itemOrder: number;
  headingsCount: number;
}

export interface CategoryItem {
  key: string;
  name: string;
  order: number;
  icon: string;
  documents: CategorySummary[];
}

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  path: string;
  snippet: string;
  score: number;
  headings: Heading[];
}
