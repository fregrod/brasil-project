export interface Heading { level: number; text: string; id: string }
export function slugify(text: string): string;
export function normalizeMarkdown(markdown: string): string;
export function remarkHeadingIds(): (tree: any) => void;
export function extractHeadings(markdown: string): Heading[];
export function extractLinks(markdown: string): { url: string; label: string; line?: number }[];
export function resolveDocumentLink(currentPath: string, href: string): { path: string; anchor: string } | null;
