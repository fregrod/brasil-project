import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { MermaidBlock } from './MermaidBlock';
import { ExternalLink, Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  currentPath: string;
  onNavigate: (path: string) => void;
}

function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function resolveRelativePath(currentPath: string, href: string): string {
  // If it's an anchor on the same page
  if (href.startsWith('#')) return href;

  // Clean trailing/leading slashes
  const cleanHref = href.split('#')[0];
  const parts = currentPath.split('/');
  parts.pop(); // Remove current filename

  const hrefSegments = cleanHref.split('/');
  for (const segment of hrefSegments) {
    if (segment === '.' || segment === '') continue;
    if (segment === '..') {
      if (parts.length > 0) parts.pop();
    } else {
      parts.push(segment);
    }
  }
  return parts.join('/');
}

const CodeBlock: React.FC<{ language?: string; value: string }> = ({ language, value }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-lg border border-border-light dark:border-border-dark bg-zinc-900 text-zinc-100 overflow-hidden text-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950/60 text-xs text-zinc-400 font-mono">
        <span>{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
          title="Copiar código"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed">
        <code>{value}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  currentPath,
  onNavigate,
}) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          h1: ({ children }) => {
            const text = String(children);
            const id = slugify(text);
            return <h1 id={id}>{children}</h1>;
          },
          h2: ({ children }) => {
            const text = String(children);
            const id = slugify(text);
            return (
              <h2 id={id} className="group flex items-center justify-between">
                <span>{children}</span>
                <a
                  href={`#${id}`}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm no-underline ml-2"
                  aria-label="Link para esta seção"
                >
                  #
                </a>
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            const id = slugify(text);
            return (
              <h3 id={id} className="group flex items-center justify-between">
                <span>{children}</span>
                <a
                  href={`#${id}`}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs no-underline ml-2"
                  aria-label="Link para esta seção"
                >
                  #
                </a>
              </h3>
            );
          },
          table: ({ children }) => (
            <div className="markdown-table-wrapper">
              <table>{children}</table>
            </div>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (language === 'mermaid') {
              return <MermaidBlock chart={codeString} />;
            }

            // If it's inline code (no language, and not multiline)
            if (!match && !codeString.includes('\n')) {
              return <code {...props}>{children}</code>;
            }

            return <CodeBlock language={language} value={codeString} />;
          },
          a: ({ href, children }) => {
            if (!href) return <a>{children}</a>;

            // Handle internal in-page hash links
            if (href.startsWith('#')) {
              return (
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    const targetEl = document.getElementById(href.slice(1));
                    if (targetEl) {
                      targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {children}
                </a>
              );
            }

            // Handle relative markdown links (.md)
            if (href.endsWith('.md') || href.includes('.md#')) {
              const [filePart, hashPart] = href.split('#');
              const resolved = resolveRelativePath(currentPath, filePart);

              return (
                <a
                  href={`#${resolved}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(resolved);
                    if (hashPart) {
                      setTimeout(() => {
                        const targetEl = document.getElementById(hashPart);
                        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {children}
                </a>
              );
            }

            // External links
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5"
              >
                <span>{children}</span>
                <ExternalLink size={12} className="inline opacity-60 ml-0.5" />
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
