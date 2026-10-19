import React, { lazy, Suspense } from 'react';
import { normalizeMarkdown, remarkHeadingIds, resolveDocumentLink } from '../../shared/content.mjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
const MermaidBlock = lazy(() => import('./MermaidBlock').then(module => ({ default: module.MermaidBlock })));
const MathMarkdown = lazy(() => import('./MathMarkdown').then(module => ({ default: module.MathMarkdown })));
import { ExternalLink, Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  currentPath: string;
  onNavigate: (path: string) => void;
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
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950/60 text-xs text-zinc-400 font-mono select-none">
        <span>{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-zinc-200 transition-colors cursor-pointer"
          title="Copiar código"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed select-text">
        <code className="select-text">{value}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(({
  content,
  currentPath,
  onNavigate,
}) => {
  const normalized = normalizeMarkdown(content);
  const Markdown = /\$/.test(normalized.replace(/\\\$/g, '')) ? MathMarkdown : ReactMarkdown;
  return (
    <div className="markdown-body">
      <Suspense fallback={<p role="status">Carregando fórmulas…</p>}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath, remarkHeadingIds]}
        rehypePlugins={[rehypeRaw]}
        components={{
          pre: ({ children }) => <>{children}</>,
          h1: ({ children, id }) => {
            return <h1 id={id}>{children}</h1>;
          },
          h2: ({ children, id }) => {
            return (
              <h2 id={id} className="group flex items-center justify-between">
                <span>{children}</span>
                <a
                  href={`#${currentPath}#${id}`}
                  onClick={(event) => { event.preventDefault(); onNavigate(`${currentPath}#${id}`); }}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm no-underline ml-2 select-none"
                  aria-label="Link para esta seção"
                >
                  #
                </a>
              </h2>
            );
          },
          h3: ({ children, id }) => {
            return (
              <h3 id={id} className="group flex items-center justify-between">
                <span>{children}</span>
                <a
                  href={`#${currentPath}#${id}`}
                  onClick={(event) => { event.preventDefault(); onNavigate(`${currentPath}#${id}`); }}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs no-underline ml-2 select-none"
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
              return <Suspense fallback={<p role="status">Carregando diagrama…</p>}><MermaidBlock chart={codeString} /></Suspense>;
            }

            // If it's inline code (no language, and not multiline)
            if (!match && !codeString.includes('\n')) {
              return <code {...props}>{children}</code>;
            }

            return <CodeBlock language={language} value={codeString} />;
          },
          a: ({ href, children }) => {
            if (!href) return <a>{children}</a>;

            const internal = resolveDocumentLink(currentPath, href);
            if (internal && (href.startsWith('#') || /\.md(?:#|$)/.test(href))) {
              const destination = `${internal.path}${internal.anchor ? `#${internal.anchor}` : ''}`;
              return <a href={`#${destination}`} onClick={(event) => { event.preventDefault(); onNavigate(destination); }}>{children}</a>;
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
        {normalized}
      </Markdown>
      </Suspense>
    </div>
  );
});
