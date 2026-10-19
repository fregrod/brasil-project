import React, { useState, useEffect, useMemo } from 'react';
import rawDocuments from './data/content.json';
import rawCategories from './data/categories.json';
import { DocumentItem, CategoryItem } from './types';
import { initSearch } from './services/search';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { TableOfContents } from './components/TableOfContents';
import { SearchModal } from './components/SearchModal';
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  Calendar,
  Layers,
  ArrowUp,
  Network,
} from 'lucide-react';
import { GraphView } from './components/GraphView';

const documents = rawDocuments as DocumentItem[];
const categories = rawCategories as CategoryItem[];

export function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [currentView, setCurrentView] = useState<'reader' | 'graph'>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash === 'grafo' ? 'graph' : 'reader';
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && hash !== 'grafo' && documents.some((d) => d.path === hash)) {
      return hash;
    }
    return 'README.md';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Initialize Search Index once on startup
  useEffect(() => {
    initSearch(documents);
  }, []);

  // Update theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Listen to hash changes in URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash === 'grafo') {
        setCurrentView('graph');
      } else if (hash && documents.some((d) => d.path === hash)) {
        setCurrentPath(hash);
        setCurrentView('reader');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to top listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setCurrentView('reader');
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentDoc = useMemo(() => {
    return documents.find((d) => d.path === currentPath) || documents[0];
  }, [currentPath]);

  const currentIndex = useMemo(() => {
    return documents.findIndex((d) => d.path === currentDoc.path);
  }, [currentDoc]);

  const prevDoc = currentIndex > 0 ? documents[currentIndex - 1] : null;
  const nextDoc = currentIndex < documents.length - 1 ? documents[currentIndex + 1] : null;

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#${currentDoc.path}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onNavigateHome={() => navigateTo('README.md')}
      />

      <div className="flex-1 w-full flex">
        {/* Sidebar with [ Leitor | Grafo ] on top */}
        <Sidebar
          categories={categories}
          activePath={currentDoc.path}
          onSelectDoc={navigateTo}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          currentView={currentView}
          onToggleView={(view) => {
            setCurrentView(view);
            window.location.hash = view === 'graph' ? 'grafo' : currentPath;
          }}
        />

        {/* Central Workspace: GraphView or Reader */}
        {currentView === 'graph' ? (
          <div className="flex-1 lg:pl-64 xl:pl-72 w-full min-w-0">
            <GraphView
              onSelectDoc={navigateTo}
              onClose={() => {
                setCurrentView('reader');
                window.location.hash = currentPath;
              }}
              isDarkMode={isDarkMode}
            />
          </div>
        ) : (
          <main className="flex-1 lg:pl-64 xl:pl-72 flex justify-center w-full min-w-0">
            <div className="w-full max-w-4xl px-4 sm:px-8 py-8 sm:py-12">
              {/* Minimalist Breadcrumb & Category Tag */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-border-light dark:border-border-dark text-xs">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-medium">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
                    <Layers size={13} />
                    {currentDoc.category}
                  </span>
                  <span>/</span>
                  <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[200px] sm:max-w-xs">
                    {currentDoc.fileName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentView('graph');
                      window.location.hash = 'grafo';
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors text-xs"
                    title="Ver este e outros documentos no Grafo de Conhecimento"
                  >
                    <Network size={13} />
                    <span className="hidden sm:inline">Ver no Grafo</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors text-xs"
                    title="Copiar link direto para este documento"
                  >
                    {copiedLink ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Link copiado</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={13} />
                        <span>Compartilhar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Document Body */}
              <article className="min-w-0">
                <MarkdownRenderer
                  content={currentDoc.rawContent}
                  currentPath={currentDoc.path}
                  onNavigate={navigateTo}
                />
              </article>

            {/* Next / Previous Document Navigation */}
            <div className="mt-16 pt-8 border-t border-border-light dark:border-border-dark grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevDoc ? (
                <button
                  onClick={() => navigateTo(prevDoc.path)}
                  className="group flex flex-col items-start p-4 rounded-xl border border-border-light dark:border-border-dark hover:border-zinc-400 dark:hover:border-zinc-600 bg-surface-light dark:bg-surface-dark transition-all text-left"
                >
                  <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    <ChevronLeft size={13} /> Anterior
                  </span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white line-clamp-1">
                    {prevDoc.title}
                  </span>
                </button>
              ) : (
                <div />
              )}

              {nextDoc ? (
                <button
                  onClick={() => navigateTo(nextDoc.path)}
                  className="group flex flex-col items-end p-4 rounded-xl border border-border-light dark:border-border-dark hover:border-zinc-400 dark:hover:border-zinc-600 bg-surface-light dark:bg-surface-dark transition-all text-right sm:col-start-2"
                >
                  <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                    Próximo <ChevronRight size={13} />
                  </span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white line-clamp-1">
                    {nextDoc.title}
                  </span>
                </button>
              ) : null}
            </div>

            {/* Editorial Footer */}
            <footer className="mt-16 pt-6 border-t border-border-light/60 dark:border-border-dark/60 text-center text-xs text-zinc-400 dark:text-zinc-500 space-y-1">
              <p>Brasil Project — Repositório de Política, Economia e Instituições Brasileiras</p>
              <p className="text-[11px]">Fundamentado exclusivamente em fontes oficiais primárias.</p>
            </footer>
          </div>

          {/* Right Table of Contents (Desktop only) */}
          <TableOfContents
            headings={currentDoc.headings}
            wordCount={currentDoc.wordCount}
            readTimeMinutes={currentDoc.readTimeMinutes}
          />
        </main>
      )}
    </div>

      {/* Floating Scroll to Top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-20 p-2.5 rounded-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-md transition-all hover:scale-105"
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
        >
          <ArrowUp size={16} />
        </button>
      )}

      {/* Instant Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={navigateTo}
      />
    </div>
  );
}
