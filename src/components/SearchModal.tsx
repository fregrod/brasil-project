import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CornerDownLeft, FileText, ArrowRight } from 'lucide-react';
import { searchContent } from '../services/search';
import { SearchResult } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const res = searchContent(query, 10);
    setResults(res);
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelectResult(results[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onSelectResult]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-border-light dark:border-border-dark gap-3">
          <Search size={18} className="text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Pesquisar em todo o repositório (ex: Petrobras, arcabouço, STF, 6x1)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm placeholder:text-zinc-400 focus:outline-none text-zinc-900 dark:text-zinc-100"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block font-mono text-[10px] uppercase px-1.5 py-0.5 rounded border border-border-light dark:border-border-dark text-zinc-400">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-border-light/50 dark:divide-border-dark/50">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs">
              <FileText size={28} className="mx-auto mb-2 opacity-40" />
              <p>Digite palavras-chave para busca textual instantânea</p>
              <p className="mt-1 text-[11px] text-zinc-400">47 documentos indexados localmente no seu navegador</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs">
              <p>Nenhum resultado encontrado para &quot;{query}&quot;</p>
              <p className="mt-1 text-[11px]">Tente buscar termos mais amplos ou nomes de operações</p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectResult(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500">
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                        Abrir <CornerDownLeft size={11} />
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-1.5">
                    {item.title}
                  </h4>
                  {item.snippet && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.snippet}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900/40 border-t border-border-light dark:border-border-dark flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>{results.length} resultados encontrados</span>
            <div className="flex items-center gap-3">
              <span>↑↓ para navegar</span>
              <span>↵ para selecionar</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
