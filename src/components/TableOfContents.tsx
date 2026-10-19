import React, { useEffect, useState } from 'react';
import { Heading } from '../types';
import { AlignLeft, Clock, FileText } from 'lucide-react';

interface TableOfContentsProps {
  headings: Heading[];
  wordCount: number;
  readTimeMinutes: number;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  wordCount,
  readTimeMinutes,
}) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: '-80px 0% -60% 0%',
        threshold: 0,
      }
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [headings]);

  const filteredHeadings = headings.filter((h) => h.level === 2 || h.level === 3);

  return (
    <aside className="w-64 shrink-0 hidden xl:block sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 text-xs">
      <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500 pb-3 mb-4 border-b border-border-light dark:border-border-dark font-mono">
        <span className="flex items-center gap-1.5">
          <Clock size={12} />
          {readTimeMinutes} min de leitura
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <FileText size={12} />
          {wordCount.toLocaleString('pt-BR')} palavras
        </span>
      </div>

      {filteredHeadings.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] mb-3">
            <AlignLeft size={13} />
            Nesta Página
          </div>
          <nav className="space-y-1">
            {filteredHeadings.map((h, i) => {
              const isActive = activeId === h.id;
              return (
                <a
                  key={`${h.id}-${i}`}
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(h.id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`block py-1 transition-colors leading-relaxed ${
                    h.level === 3 ? 'pl-3' : 'pl-0'
                  } ${
                    isActive
                      ? 'text-zinc-900 dark:text-white font-medium'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {h.text}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </aside>
  );
};
