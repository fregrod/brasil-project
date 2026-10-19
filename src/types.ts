export interface Heading {
  level: number;
  text: string;
  id: string;
}

export interface DocumentItem {
  reviewedAt: string;
  evidencePeriod: string;
  contentHash: string;
  contentUrl: string;
  sources: { url: string; label: string; line?: number }[];
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
  readmePath?: string | null;
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

export interface GraphNode {
  id: string;
  title: string;
  category: string;
  categoryKey: string;
  categoryOrder: number;
  color: string;
  wordCount: number;
  readTimeMinutes: number;
  isHub: boolean;
  size: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'explicit' | 'category' | 'thematic' | 'hub';
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type DocumentMetadata = Omit<DocumentItem, 'rawContent' | 'plainText'>;
