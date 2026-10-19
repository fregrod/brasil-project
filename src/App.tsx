import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import rawDocuments from './data/documents.json';
import { loadDocument } from './lib/documents';
import rawCategories from './data/categories.json';
import { DocumentMetadata, CategoryItem } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
const MarkdownRenderer = lazy(() => import('./components/MarkdownRenderer').then(module => ({ default: module.MarkdownRenderer })));
import { TableOfContents } from './components/TableOfContents';
const SearchModal = lazy(() => import('./components/SearchModal').then(module => ({ default: module.SearchModal })));
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  Calendar,
  Layers,
  ArrowUp,
  Network,
  FolderOpen,
  FileText,
  ArrowRight,
} from 'lucide-react';
const GraphView = lazy(() => import('./components/GraphView').then(module => ({ default: module.GraphView })));
const AssistantSidebar = lazy(() => import('./components/AssistantSidebar').then(module => ({ default: module.AssistantSidebar })));

const documents = rawDocuments as DocumentMetadata[];
const categories = rawCategories as CategoryItem[];

export function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [currentView, setCurrentView] = useState<'reader' | 'graph'>(() => {
    const hash = window.location.hash.replace(/^#/, '').split('#')[0];
    return hash === 'grafo' ? 'graph' : 'reader';
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '').split('#')[0];
    if (hash && hash !== 'grafo' && documents.some((d) => d.path === hash)) {
      return hash;
    }
    return 'README.md';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(() => window.matchMedia('(min-width: 1280px)').matches);
  const [assistantHasOpened, setAssistantHasOpened] = useState(isAssistantOpen);
  const closeAssistant = useCallback(() => setIsAssistantOpen(false), []);
  const openSearch = useCallback(() => {
    setIsAssistantOpen(false);
    setIsSearchOpen(true);
  }, []);
  useEffect(() => { if (isAssistantOpen) setAssistantHasOpened(true); }, [isAssistantOpen]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loadedContent, setLoadedContent] = useState<{path: string; text: string} | null>(null);
  const [documentError, setDocumentError] = useState('');
  const [section, setSection] = useState(() => window.location.hash.slice(1).split('#').slice(1).join('#'));
  const [retry, setRetry] = useState(0);

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
      const hash = window.location.hash.replace(/^#/, '').split('#')[0];
      if (hash === 'grafo') {
        setCurrentView('graph');
      } else if (hash && documents.some((d) => d.path === hash)) {
        setCurrentPath(hash);
        setSection(window.location.hash.slice(1).split('#').slice(1).join('#'));
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
        setIsAssistantOpen(false);
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        openSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]);

  // Scroll to top listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = useCallback((destination: string) => {
    const [path, ...anchor] = destination.split('#');
    if (!documents.some(doc => doc.path === path)) return;
    setCurrentPath(path);
    setSection(anchor.join('#'));
    setCurrentView('reader');
    window.location.hash = destination;
    if (!anchor.length) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const currentDoc = useMemo(() => {
    return documents.find((d) => d.path === currentPath) || documents[0];
  }, [currentPath]);

  useEffect(() => {
    if (currentView !== 'reader') return;
    const controller = new AbortController();
    setDocumentError('');
    loadDocument(currentDoc, controller.signal).then(text => {
      if (!controller.signal.aborted) setLoadedContent({ path: currentDoc.path, text });
    }).catch(error => {
      if (!controller.signal.aborted) setDocumentError(error instanceof Error ? error.message : 'Erro ao carregar documento.');
    });
    return () => controller.abort();
  }, [currentDoc, currentView, retry]);

  useEffect(() => {
    if (loadedContent?.path !== currentPath || !section) return;
    // Lazy Markdown may still be mounting. Wait for the target itself, rather than a fixed timeout.
    const scroll = () => {
      const target = document.getElementById(section);
      if (!target) return false;
      target.scrollIntoView({ behavior: 'smooth' });
      return true;
    };
    if (scroll()) return;
    const observer = new MutationObserver(() => { if (scroll()) observer.disconnect(); });
    observer.observe(document.getElementById('root')!, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [loadedContent, currentPath, section]);

  const currentIndex = useMemo(() => {
    return documents.findIndex((d) => d.path === currentDoc.path);
  }, [currentDoc]);

  const prevDoc = currentIndex > 0 ? documents[currentIndex - 1] : null;
  const nextDoc = currentIndex < documents.length - 1 ? documents[currentIndex + 1] : null;

  const isReadmeDoc = currentDoc.fileName.toLowerCase() === 'readme.md';

  const currentCategory = useMemo(() => {
    return (
      categories.find(
        (c) => c.readmePath === currentDoc.path || c.key === currentDoc.categoryKey
      ) || null
    );
  }, [currentDoc]);

  const folderPages = useMemo(() => {
    if (!currentCategory) return [];
    return currentCategory.documents.filter(
      (d) => d.fileName.toLowerCase() !== 'readme.md'
    );
  }, [currentCategory]);

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}#${currentDoc.path}`;
    navigator.clipboard.writeText(section ? `${url}#${section}` : url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }).catch(() => setCopiedLink(false));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onOpenSearch={openSearch}
        onToggleSidebar={() => { setIsAssistantOpen(false); setIsSidebarOpen((prev) => !prev); }}
        isSidebarOpen={isSidebarOpen}
        onNavigateHome={() => navigateTo('README.md')}
        isAssistantOpen={isAssistantOpen}
        onToggleAssistant={() => { setIsSidebarOpen(false); setIsSearchOpen(false); setIsAssistantOpen(value => !value); }}
      />

      <div className={`flex-1 w-full flex ${isAssistantOpen ? 'xl:pr-[360px]' : ''}`}>
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
            <Suspense fallback={<p role="status" className="p-8">Carregando grafo…</p>}>
            <GraphView
              onSelectDoc={navigateTo}
              onClose={() => {
                setCurrentView('reader');
                window.location.hash = currentPath;
              }}
              isDarkMode={isDarkMode}
              activePath={currentDoc.path}
            />
            </Suspense>
          </div>
        ) : (
          <main className="flex-1 lg:pl-64 xl:pl-72 flex justify-center gap-4 w-full min-w-0">
            <div className="w-full min-w-0 max-w-4xl flex-1 px-4 sm:px-8 py-8 sm:py-12">
              {/* Minimalist Breadcrumb & Category Tag */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-border-light dark:border-border-dark text-xs">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-medium">
                  <button
                    onClick={() => currentCategory?.readmePath && navigateTo(currentCategory.readmePath)}
                    className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    title={currentCategory?.readmePath ? `Ir para o Resumão de ${currentDoc.category}` : currentDoc.category}
                  >
                    <Layers size={13} />
                    {currentDoc.category}
                  </button>
                  <span>/</span>
                  <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[200px] sm:max-w-xs font-medium">
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
                    title={`Localizar "${currentDoc.title}" no Grafo`}
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

              {/* Notion-style Top Banner for Chapter Readme */}
              {isReadmeDoc && folderPages.length > 0 && (
                <div className="mb-8 p-3.5 rounded-xl border border-border-light dark:border-border-dark bg-zinc-50/70 dark:bg-zinc-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                    <div className="w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-800 dark:text-zinc-200 font-bold text-[11px]">
                      {folderPages.length}
                    </div>
                    <span>
                      Este capítulo reúne <strong>{folderPages.length} estudos temáticos</strong>.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      document.getElementById('notion-subpages-grid')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1 group"
                  >
                    <span>Ver índice de páginas</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}

              {/* Document Body */}
              <article className="min-w-0 select-text">
                {documentError ? (
                  <div role="alert"><p>{documentError}</p><button onClick={() => setRetry(value => value + 1)} className="underline">Tentar novamente</button></div>
                ) : loadedContent?.path === currentDoc.path ? (
                  <Suspense fallback={<p role="status">Preparando leitura…</p>}>
                    <MarkdownRenderer content={loadedContent.text} currentPath={currentDoc.path} onNavigate={navigateTo} />
                  </Suspense>
                ) : <p role="status">Carregando documento…</p>}

              </article>

              {/* Notion-Style Subpages Grid on README */}
              {isReadmeDoc && folderPages.length > 0 && (
                <section id="notion-subpages-grid" className="mt-12 pt-8 border-t border-border-light dark:border-border-dark select-text">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <FolderOpen size={16} className="text-zinc-700 dark:text-zinc-300" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                        Estudos e Páginas deste Capítulo ({folderPages.length})
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">
                      Navegação direta no módulo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {folderPages.map((page, index) => {
                      const fullDoc = documents.find((d) => d.path === page.path);
                      return (
                        <div
                          key={page.id}
                          role="link"
                          tabIndex={0}
                          onClick={() => navigateTo(page.path)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigateTo(page.path);
                            }
                          }}
                          className="group p-4 rounded-xl border border-border-light dark:border-border-dark hover:border-zinc-400 dark:hover:border-zinc-500 bg-surface-light dark:bg-zinc-900/40 hover:bg-zinc-50/80 dark:hover:bg-zinc-900 text-left transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs cursor-pointer select-text"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-950 transition-colors">
                                  <FileText size={14} />
                                </div>
                                <span className="text-[10px] font-mono font-semibold text-zinc-400">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                              </div>
                              <ArrowRight
                                size={14}
                                className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-950 dark:group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
                              />
                            </div>

                            <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white leading-snug mb-1.5 line-clamp-2">
                              {page.title}
                            </h4>

                            {fullDoc?.excerpt && (
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                                {fullDoc.excerpt}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-border-light/60 dark:border-border-dark/60 text-[10px] text-zinc-400 font-mono">
                            <span>⏱️ {page.readTimeMinutes} min de leitura</span>
                            {page.headingsCount > 0 && (
                              <>
                                <span>•</span>
                                <span>{page.headingsCount} seções</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* On a child page: Quick back-to-chapter Notion link */}
              {!isReadmeDoc && currentCategory?.readmePath && (
                <div className="mt-12 p-3.5 rounded-xl border border-border-light/80 dark:border-border-dark/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <FolderOpen size={14} className="text-zinc-400" />
                    <span>Capítulo: <strong className="text-zinc-800 dark:text-zinc-200">{currentCategory.name}</strong> ({folderPages.length} páginas)</span>
                  </div>
                  <button
                    onClick={() => navigateTo(currentCategory.readmePath!)}
                    className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1"
                  >
                    <span>Ver Resumão do Capítulo</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}

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
              <p className="text-[11px]">Fontes oficiais, acadêmicas e primárias identificadas. Fatos, interpretações e limites apresentados separadamente.</p>
            </footer>
          </div>

          {/* Right Table of Contents (Desktop only) */}
          {!isAssistantOpen && loadedContent?.path === currentDoc.path && <TableOfContents
            headings={currentDoc.headings}
            wordCount={currentDoc.wordCount}
            readTimeMinutes={currentDoc.readTimeMinutes}
            onNavigateAnchor={(id) => navigateTo(`${currentPath}#${id}`)}
          />}
        </main>
      )}
    </div>

      {/* Floating Scroll to Top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-6 right-6 ${isAssistantOpen ? 'xl:right-[380px]' : ''} z-20 p-2.5 rounded-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-md transition-all hover:scale-105`}
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
        >
          <ArrowUp size={16} />
        </button>
      )}

      {/* Instant Search Modal */}
      {isSearchOpen && <Suspense fallback={<p role="status" className="fixed top-20 left-1/2 z-50">Carregando pesquisa…</p>}>
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={navigateTo}
      />
      </Suspense>}
      {(isAssistantOpen || assistantHasOpened) && <Suspense fallback={isAssistantOpen ? <p role="status" className="fixed right-4 top-20 z-40 text-xs">Abrindo consulta…</p> : null}>
        <AssistantSidebar isOpen={isAssistantOpen} onClose={closeAssistant} onNavigate={navigateTo} currentDoc={currentDoc} />
      </Suspense>}
    </div>
  );
}
