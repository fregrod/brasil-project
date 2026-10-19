import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, ExternalLink, Loader2, MessageSquareText, Plus, Send, X } from 'lucide-react';
import { askDocuments } from '../services/assistant';
import { documentCount } from '../services/search';
import type { DocumentAnswer } from '../../shared/assistant.mjs';
import type { DocumentMetadata } from '../types';
import { TableOfContents } from './TableOfContents';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (destination: string) => void;
  currentDoc: DocumentMetadata;
}
interface Turn { id: number; question: string; answer?: DocumentAnswer; error?: string }
const suggestions = ['Qual foi a inflação no governo Lula 3?', 'O que mudou na Eletrobras?', 'O que dizem os estudos sobre saneamento?'];
const destination = (path: string, anchor: string) => `${path}${anchor ? `#${anchor}` : ''}`;

export function AssistantSidebar({ isOpen, onClose, onNavigate, currentDoc }: Props) {
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'ask' | 'contents'>('ask');
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1280px)').matches);
  const panel = useRef<HTMLElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const history = useRef<HTMLDivElement>(null);
  const request = useRef(0);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const update = () => setDesktop(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => () => { request.current++; }, []);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    if (!desktop) { document.body.style.overflow = 'hidden'; input.current?.focus(); }
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab' || desktop) return;
      const nodes = panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], textarea, summary, [tabindex="0"]');
      const focusable = [...(nodes || [])].filter(node => node.getClientRects().length);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      if (!desktop) { document.body.style.overflow = previousOverflow; previous?.focus(); }
      document.removeEventListener('keydown', keydown);
    };
  }, [isOpen, desktop, onClose]);
  useEffect(() => {
    const last = history.current?.querySelector<HTMLElement>('section:last-of-type');
    if (history.current && last) history.current.scrollTop = last.offsetTop - history.current.offsetTop;
  }, [turns, loading, tab, isOpen]);

  const submit = async (value = question) => {
    const text = value.trim();
    if (!text || text.length > 400 || loading) return;
    const id = ++request.current;
    const previousQuestion = [...turns].reverse().find(turn => turn.answer?.found)?.question || '';
    setTab('ask'); setQuestion(''); setLoading(true);
    setTurns(old => [...old, { id, question: text }].slice(-6));
    try {
      const answer = await askDocuments(text, previousQuestion);
      if (request.current === id) setTurns(old => old.map(turn => turn.id === id ? { ...turn, answer } : turn));
    } catch {
      if (request.current === id) setTurns(old => old.map(turn => turn.id === id ? { ...turn, error: 'Não foi possível carregar a consulta. Verifique a conexão e tente novamente.' } : turn));
    } finally { if (request.current === id) { setLoading(false); input.current?.focus(); } }
  };
  const navigate = (path: string, anchor: string) => {
    onNavigate(destination(path, anchor));
    if (!desktop) onClose();
  };
  if (!isOpen) return null;

  return <>
    {!desktop && <button aria-label="Fechar painel de consulta" tabIndex={-1} onClick={onClose} className="fixed inset-0 top-14 z-40 bg-black/30 backdrop-blur-[2px]" />}
    <aside ref={panel} id="document-assistant" aria-label="Consultar documentos" role={desktop ? 'complementary' : 'dialog'} aria-modal={desktop ? undefined : true}
      className="fixed right-0 top-14 bottom-0 z-40 w-[360px] max-w-full flex flex-col border-l border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-xl xl:shadow-none">
      <div className="p-4 pb-3 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <MessageSquareText size={17} />
            <h2 className="text-sm font-semibold">Consultar documentos</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar assistente" className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={17} /></button>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900" aria-label="Modo do painel">
          <button aria-pressed={tab === 'ask'} onClick={() => setTab('ask')} className={`flex-1 py-1.5 rounded-md text-xs font-medium ${tab === 'ask' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>Perguntar</button>
          <button aria-pressed={tab === 'contents'} onClick={() => setTab('contents')} className={`flex-1 py-1.5 rounded-md text-xs font-medium ${tab === 'contents' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>Nesta página</button>
        </div>
      </div>

      {tab === 'contents' ? <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{currentDoc.title}</p>
        <TableOfContents embedded headings={currentDoc.headings} wordCount={currentDoc.wordCount} readTimeMinutes={currentDoc.readTimeMinutes} onNavigateAnchor={anchor => navigate(currentDoc.path, anchor)} />
      </div> : <>
        <div ref={history} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-6">
          {turns.length === 0 ? <div className="pt-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-border-light dark:border-border-dark bg-zinc-50 dark:bg-zinc-900 mb-4"><BookOpen size={19} className="text-zinc-500" /></div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">O que você quer entender?</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">Encontre trechos dos {documentCount} documentos e abra as páginas que ajudam a responder sua pergunta.</p>
            <div className="space-y-2 mt-5">
              {suggestions.map(suggestion => <button key={suggestion} onClick={() => void submit(suggestion)} className="w-full text-left text-xs leading-relaxed p-3 rounded-lg border border-border-light dark:border-border-dark text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex gap-2 justify-between items-center"><span>{suggestion}</span><ArrowRight size={13} className="shrink-0 text-zinc-400" /></button>)}
            </div>
          </div> : <>
            <div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-wider text-zinc-400">Consulta ao acervo</span><button disabled={loading} onClick={() => { request.current++; setTurns([]); setQuestion(''); input.current?.focus(); }} className="flex items-center gap-1 text-xs text-zinc-500 disabled:opacity-40"><Plus size={13} />Nova consulta</button></div>
            {turns.map(turn => <section key={turn.id} className="space-y-3" aria-label={`Pergunta: ${turn.question}`}>
              <p className="ml-5 rounded-xl rounded-br-sm bg-zinc-100 dark:bg-zinc-800 p-3 text-sm text-zinc-800 dark:text-zinc-100 leading-relaxed break-words">{turn.question}</p>
              {turn.error ? <div role="alert" className="text-xs text-red-600 dark:text-red-400 leading-relaxed"><p>{turn.error}</p><button onClick={() => { setTurns(old => old.filter(item => item.id !== turn.id)); void submit(turn.question); }} className="underline mt-2">Tentar novamente</button></div> : turn.answer ? <div className="space-y-3">
                <p role="status" className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{turn.answer.message}</p>
                {turn.answer.contextUsed && <p className="text-[11px] text-zinc-400">Considerando também o assunto da pergunta anterior.</p>}
                {turn.answer.passages.map((passage, i) => <div key={`${passage.path}-${passage.anchor}`} className="rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                  <div className="p-3 space-y-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-zinc-400">Trecho {i + 1}{passage.kind === 'table' ? ' · Linha de tabela' : ''}</p>
                    <blockquote className="text-[13px] leading-[1.8] text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">{passage.text}</blockquote>
                    {passage.sources.length > 0 && <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">{passage.sources.slice(0, 2).map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-2"><span className="break-words">{source.label}</span><ExternalLink size={10} className="shrink-0" /></a>)}</div>}
                    <details className="text-[10px] leading-relaxed text-zinc-500"><summary className="cursor-pointer">Recorte da evidência</summary><p className="pt-1.5">{passage.evidencePeriod}</p></details>
                  </div>
                  <a href={`#${destination(passage.path, passage.anchor)}`} onClick={event => { event.preventDefault(); navigate(passage.path, passage.anchor); }} className="block px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-t border-border-light dark:border-border-dark text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <span className="block font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">{passage.title}</span>
                    <span className="flex gap-1 items-start text-[10px] text-zinc-500 mt-0.5"><span className="min-w-0 break-words">{passage.section}</span><ArrowRight size={11} className="shrink-0 mt-0.5" /></span>
                  </a>
                </div>)}
                {turn.answer.pages.length > 0 && <div className="space-y-1.5"><p className="text-[10px] text-zinc-400 uppercase tracking-wider">Para aprofundar</p>{turn.answer.pages.map(page => <a key={page.path} href={`#${destination(page.path, page.anchor)}`} onClick={event => { event.preventDefault(); navigate(page.path, page.anchor); }} className="block text-xs text-zinc-600 dark:text-zinc-400 hover:underline leading-relaxed">{page.title}</a>)}</div>}
              </div> : <p role="status" className="flex items-center gap-2 text-xs text-zinc-500"><Loader2 size={13} className="animate-spin" />Buscando trechos…</p>}
            </section>)}
          </>}
        </div>
        <form onSubmit={event => { event.preventDefault(); void submit(); }} className="p-3 border-t border-border-light dark:border-border-dark space-y-2">
          <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 focus-within:border-zinc-500 dark:focus-within:border-zinc-400 bg-background-light dark:bg-background-dark p-2">
            <label htmlFor="document-question" className="sr-only">Sua pergunta sobre os documentos</label>
            <textarea id="document-question" ref={input} value={question} onChange={event => setQuestion(event.target.value)} maxLength={400} rows={2} placeholder="Pergunte sobre os estudos…" onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void submit(); }
            }} className="block w-full resize-none bg-transparent p-1 text-base sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none leading-relaxed" />
            <div className="flex justify-between items-center pl-1"><span className="text-[10px] text-zinc-400">{question.length}/400</span><button type="submit" disabled={!question.trim() || loading} aria-label="Consultar acervo" className="p-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 disabled:opacity-30 transition-opacity">{loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}</button></div>
          </div>
          <p className="text-[10px] leading-relaxed text-zinc-400 px-1">Busca local. Seleciona trechos existentes; não cria novas análises.</p>
        </form>
      </>}
    </aside>
  </>;
}
