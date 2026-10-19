import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check } from 'lucide-react';

interface MermaidBlockProps {
  chart: string;
}

let mermaidIdCounter = 0;

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const isDark = document.documentElement.classList.contains('dark');

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: isDark ? 'dark' : 'neutral',
      fontFamily: 'Inter, system-ui, sans-serif',
      themeVariables: isDark
        ? {
            darkMode: true,
            background: '#121214',
            primaryColor: '#1E1E22',
            primaryTextColor: '#F4F4F5',
            primaryBorderColor: '#3F3F46',
            lineColor: '#71717A',
            secondaryColor: '#18181B',
            tertiaryColor: '#121214',
          }
        : {
            darkMode: false,
            background: '#FFFFFF',
            primaryColor: '#F4F4F5',
            primaryTextColor: '#18181B',
            primaryBorderColor: '#E4E4E7',
            lineColor: '#71717A',
            secondaryColor: '#FAFAFA',
            tertiaryColor: '#FFFFFF',
          },
    });

    const uniqueId = `mermaid-svg-${Date.now()}-${mermaidIdCounter++}`;

    const renderChart = async () => {
      try {
        setHasError(false);
        const { svg: renderedSvg } = await mermaid.render(uniqueId, chart.trim());
        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch (err) {
        console.warn('Mermaid render error:', err);
        if (isMounted) {
          setHasError(true);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(chart.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (hasError) {
    return (
      <div className="my-6 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-4 font-mono text-xs text-red-700 dark:text-red-400">
        <p className="font-semibold mb-2">Diagrama Mermaid (Erro de Sintaxe no documento):</p>
        <pre className="overflow-x-auto whitespace-pre">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="relative my-8 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 sm:p-6 transition-all shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-light dark:border-border-dark text-xs text-zinc-400 dark:text-zinc-500 font-mono">
        <span className="flex items-center gap-1.5 uppercase tracking-wider font-medium text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600"></span>
          Diagrama Conceitual
        </span>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors py-1 px-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title="Copiar código Mermaid"
        >
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>

      <div
        ref={containerRef}
        className="overflow-x-auto flex justify-center items-center py-2 min-h-[120px]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};
