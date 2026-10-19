import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  Simulation,
} from 'd3-force';
import { DocumentItem, GraphData, GraphNode, GraphEdge } from '../types';
import rawGraphData from '../data/graph.json';
import rawContent from '../data/content.json';
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  Layers,
  ArrowRight,
  Info,
  X,
  Crosshair,
  Network,
} from 'lucide-react';

interface GraphViewProps {
  onSelectDoc: (path: string) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

const initialData = rawGraphData as GraphData;
const allDocuments = rawContent as DocumentItem[];

export const GraphView: React.FC<GraphViewProps> = ({
  onSelectDoc,
  onClose,
  isDarkMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [inspectedNode, setInspectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Transform ref for continuous render loop without re-triggering simulation
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const isDraggingNodeRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const activeDraggedNodeRef = useRef<GraphNode | null>(null);
  const hoveredNodeRef = useRef<GraphNode | null>(null);

  // Deep clone data so D3 mutations don't corrupt raw data
  const { nodes, edges, connectedMap } = useMemo(() => {
    const clonedNodes: GraphNode[] = initialData.nodes.map((n) => ({ ...n }));
    const clonedEdges: any[] = initialData.edges.map((e) => ({ ...e }));

    const connMap = new Map<string, Set<string>>();
    clonedNodes.forEach((n) => connMap.set(n.id, new Set()));

    clonedEdges.forEach((e) => {
      const s = typeof e.source === 'string' ? e.source : e.source.id;
      const t = typeof e.target === 'string' ? e.target : e.target.id;
      connMap.get(s)?.add(t);
      connMap.get(t)?.add(s);
    });

    return { nodes: clonedNodes, edges: clonedEdges, connectedMap: connMap };
  }, []);

  // Category legend
  const categories = useMemo(() => {
    const map = new Map<string, { key: string; name: string; color: string; count: number }>();
    nodes.forEach((n) => {
      if (!map.has(n.categoryKey)) {
        map.set(n.categoryKey, {
          key: n.categoryKey,
          name: n.category,
          color: n.color,
          count: 0,
        });
      }
      map.get(n.categoryKey)!.count++;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [nodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Center transform with expansive initial view
    const initialZoom = Math.min(0.75, Math.max(0.55, width / 1600));
    transformRef.current = { x: width / 2, y: height / 2, k: initialZoom };
    setPan({ x: width / 2, y: height / 2 });
    setZoom(initialZoom);

    // Setup D3 Simulation with spacious, fluid, dynamic physics
    const simulation: Simulation<GraphNode, any> = forceSimulation(nodes)
      .force(
        'link',
        forceLink(edges)
          .id((d: any) => d.id)
          .distance((d: any) => {
            if (d.type === 'hub') return 220;
            if (d.type === 'thematic') return 175;
            return 125;
          })
          .strength(0.18)
      )
      .force('charge', forceManyBody().strength(-520).distanceMax(950))
      .force(
        'collide',
        forceCollide()
          .radius((d: any) => d.size * 2.6 + 22)
          .strength(0.9)
          .iterations(3)
      )
      .force('center', forceCenter(0, 0).strength(0.014))
      .force('x', forceX(0).strength(0.01))
      .force('y', forceY(0).strength(0.01))
      .velocityDecay(0.32)
      .alphaDecay(0.014);

    let animationFrameId: number;

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x: tx, y: ty, k: tk } = transformRef.current;
      const currentHovered = hoveredNodeRef.current;
      const filterQuery = searchQuery.toLowerCase().trim();

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Apply Pan & Zoom
      ctx.translate(tx, ty);
      ctx.scale(tk, tk);

      // --- Draw Blueprint / Infinite Canvas Grid (Estilo Figma / Canva / Miro) ---
      const GRID_SIZE = 50;
      const startX = -tx / tk;
      const endX = (width - tx) / tk;
      const startY = -ty / tk;
      const endY = (height - ty) / tk;

      const firstGridX = Math.floor(startX / GRID_SIZE) * GRID_SIZE;
      const firstGridY = Math.floor(startY / GRID_SIZE) * GRID_SIZE;

      ctx.beginPath();
      for (let x = firstGridX; x <= endX; x += GRID_SIZE) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = firstGridY; y <= endY; y += GRID_SIZE) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
      ctx.lineWidth = 1 / tk;
      ctx.stroke();

      // Subtle crosshair accent points at every 2nd grid intersection
      ctx.beginPath();
      const dotStep = GRID_SIZE * 2;
      const firstDotX = Math.floor(startX / dotStep) * dotStep;
      const firstDotY = Math.floor(startY / dotStep) * dotStep;
      for (let x = firstDotX; x <= endX; x += dotStep) {
        for (let y = firstDotY; y <= endY; y += dotStep) {
          ctx.rect(x - 1.2 / tk, y - 1.2 / tk, 2.4 / tk, 2.4 / tk);
        }
      }
      ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)';
      ctx.fill();

      const connectedNeighbors = currentHovered ? connectedMap.get(currentHovered.id) : null;

      // 1. Draw Edges
      edges.forEach((edge: any) => {
        const source = edge.source;
        const target = edge.target;
        if (!source || !target || source.x == null || target.x == null) return;

        let isEdgeHighlighted = false;
        let isEdgeDimmed = false;

        if (currentHovered) {
          if (source.id === currentHovered.id || target.id === currentHovered.id) {
            isEdgeHighlighted = true;
          } else {
            isEdgeDimmed = true;
          }
        }

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (isEdgeHighlighted) {
          ctx.strokeStyle = isDarkMode ? '#FFFFFF' : '#18181B';
          ctx.lineWidth = 2 / tk;
          ctx.globalAlpha = 0.9;
        } else if (isEdgeDimmed) {
          ctx.strokeStyle = isDarkMode ? '#27272A' : '#E4E4E7';
          ctx.lineWidth = 0.8 / tk;
          ctx.globalAlpha = 0.15;
        } else {
          ctx.strokeStyle = isDarkMode ? '#3F3F46' : '#D4D4D8';
          ctx.lineWidth = 1 / tk;
          ctx.globalAlpha = 0.4;
        }

        ctx.stroke();
      });

      // 2. Draw Nodes
      nodes.forEach((node: any) => {
        if (node.x == null || node.y == null) return;

        const isHovered = currentHovered?.id === node.id;
        const isNeighbor = connectedNeighbors?.has(node.id);
        const matchesSearch = filterQuery ? node.title.toLowerCase().includes(filterQuery) : true;
        const matchesCategory = selectedCategory ? node.categoryKey === selectedCategory : true;

        let alpha = 1;
        if (currentHovered) {
          alpha = isHovered || isNeighbor ? 1 : 0.18;
        }
        if (filterQuery && !matchesSearch) {
          alpha = Math.min(alpha, 0.12);
        }
        if (selectedCategory && !matchesCategory) {
          alpha = Math.min(alpha, 0.15);
        }

        ctx.globalAlpha = alpha;

        // Outer halo / glow for hubs or hovered
        if (isHovered || (filterQuery && matchesSearch)) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size + 4, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.globalAlpha = 0.25;
          ctx.fill();
          ctx.globalAlpha = alpha;
        }

        // Main node body
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Border ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
        ctx.lineWidth = isHovered ? 2 / tk : 1 / tk;
        ctx.strokeStyle = isDarkMode ? '#09090B' : '#FFFFFF';
        ctx.stroke();

        // Node labels
        const shouldShowLabel =
          isHovered ||
          isNeighbor ||
          node.isHub ||
          (tk > 1.3 && matchesCategory) ||
          (filterQuery && matchesSearch);

        if (shouldShowLabel && alpha > 0.4) {
          ctx.font = `${isHovered ? '600' : '500'} ${Math.max(10, 11 / tk)}px Inter, system-ui, sans-serif`;
          ctx.fillStyle = isDarkMode
            ? isHovered
              ? '#FFFFFF'
              : '#D4D4D8'
            : isHovered
            ? '#09090B'
            : '#3F3F46';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(node.title, node.x, node.y + node.size + 4);
        }
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      simulation.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [nodes, edges, isDarkMode, searchQuery, selectedCategory, connectedMap]);

  // Pointer & Drag Handlers
  const findNodeAtPos = (clientX: number, clientY: number): GraphNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const { x: tx, y: ty, k: tk } = transformRef.current;
    const worldX = (mouseX - tx) / tk;
    const worldY = (mouseY - ty) / tk;

    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (node.x == null || node.y == null) continue;
      const dx = worldX - node.x;
      const dy = worldY - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= node.size + 6) {
        return node;
      }
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };

    const targetNode = findNodeAtPos(e.clientX, e.clientY);
    if (targetNode) {
      isDraggingNodeRef.current = true;
      activeDraggedNodeRef.current = targetNode;
      targetNode.fx = targetNode.x;
      targetNode.fy = targetNode.y;
    } else {
      isPanningRef.current = true;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingNodeRef.current && activeDraggedNodeRef.current) {
      const { k: tk } = transformRef.current;
      activeDraggedNodeRef.current.fx = (activeDraggedNodeRef.current.fx ?? 0) + dx / tk;
      activeDraggedNodeRef.current.fy = (activeDraggedNodeRef.current.fy ?? 0) + dy / tk;
    } else if (isPanningRef.current) {
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      setPan({ x: transformRef.current.x, y: transformRef.current.y });
    } else {
      const hovered = findNodeAtPos(e.clientX, e.clientY);
      setHoveredNode(hovered);
      hoveredNodeRef.current = hovered;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const moveDist = Math.hypot(
      e.clientX - dragStartPosRef.current.x,
      e.clientY - dragStartPosRef.current.y
    );

    if (isDraggingNodeRef.current && activeDraggedNodeRef.current) {
      if (moveDist < 5) {
        // Was a click on a node -> Open Document Map & Structure modal
        setInspectedNode(activeDraggedNodeRef.current);
      }
      activeDraggedNodeRef.current.fx = null;
      activeDraggedNodeRef.current.fy = null;
      activeDraggedNodeRef.current = null;
      isDraggingNodeRef.current = false;
    }

    isPanningRef.current = false;
  };

  const focusOnNode = (node: GraphNode) => {
    const container = containerRef.current;
    if (!container || node.x == null || node.y == null) return;
    const targetZoom = 1.35;
    const targetX = container.clientWidth / 2 - node.x * targetZoom;
    const targetY = container.clientHeight / 2 - node.y * targetZoom;

    transformRef.current = { x: targetX, y: targetY, k: targetZoom };
    setPan({ x: targetX, y: targetY });
    setZoom(targetZoom);
    setHoveredNode(node);
    hoveredNodeRef.current = node;
  };

  const inspectedDoc = useMemo(() => {
    if (!inspectedNode) return null;
    return allDocuments.find((d) => d.path === inspectedNode.id) || null;
  }, [inspectedNode]);

  const connectedNeighborNodes = useMemo(() => {
    if (!inspectedNode) return [];
    const neighborIds = connectedMap.get(inspectedNode.id);
    if (!neighborIds) return [];
    return Array.from(neighborIds)
      .map((id) => nodes.find((n) => n.id === id))
      .filter((n): n is GraphNode => n !== undefined);
  }, [inspectedNode, connectedMap, nodes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inspectedNode) {
        setInspectedNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedNode]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    const currentK = transformRef.current.k;
    const nextK = Math.max(0.3, Math.min(3.5, currentK * zoomFactor));

    // Zoom centered at mouse position
    const nextX = mouseX - (mouseX - transformRef.current.x) * (nextK / currentK);
    const nextY = mouseY - (mouseY - transformRef.current.y) * (nextK / currentK);

    transformRef.current = { x: nextX, y: nextY, k: nextK };
    setZoom(nextK);
    setPan({ x: nextX, y: nextY });
  };

  const handleResetZoom = () => {
    const container = containerRef.current;
    if (!container) return;
    const initialZoom = Math.min(0.75, Math.max(0.55, container.clientWidth / 1600));
    const target = { x: container.clientWidth / 2, y: container.clientHeight / 2, k: initialZoom };
    transformRef.current = target;
    setPan({ x: target.x, y: target.y });
    setZoom(target.k);
  };

  const handleZoomIn = () => {
    const nextK = Math.min(3.5, transformRef.current.k * 1.25);
    transformRef.current.k = nextK;
    setZoom(nextK);
  };

  const handleZoomOut = () => {
    const nextK = Math.max(0.3, transformRef.current.k * 0.8);
    transformRef.current.k = nextK;
    setZoom(nextK);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-background-light dark:bg-background-dark select-none"
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Floating Bar: Search & View Toggle */}
      <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-6 flex items-center justify-between pointer-events-none gap-3">
        {/* Search filter in graph */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md shadow-sm max-w-sm w-full">
          <Search size={14} className="text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Filtrar nós no grafo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 shadow-sm transition-colors"
          >
            <BookOpen size={13} />
            <span className="hidden sm:inline">Voltar ao Leitor</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills (Bottom / Left on Desktop) */}
      <div className="absolute top-16 left-4 sm:left-6 max-w-md hidden md:flex flex-wrap gap-1.5 pointer-events-auto">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(isSelected ? null : cat.key)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'border-border-light dark:border-border-dark bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="truncate max-w-[130px]">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Floating HUD Tooltip when a node is hovered */}
      {hoveredNode && (
        <div className="absolute bottom-6 left-6 max-w-xs sm:max-w-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md p-4 shadow-xl pointer-events-none transition-all animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: hoveredNode.color }}
            />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500">
              {hoveredNode.category}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 leading-snug">
            {hoveredNode.title}
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono pt-2 border-t border-border-light dark:border-border-dark">
            <span>{hoveredNode.readTimeMinutes} min de leitura</span>
            <span>•</span>
            <span>{connectedMap.get(hoveredNode.id)?.size || 0} conexões</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
            <span>Clique para abrir o documento</span>
            <ArrowRight size={11} />
          </div>
        </div>
      )}

      {/* Zoom and Navigation Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm transition-colors"
          title="Aproximar (+)"
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm transition-colors"
          title="Afastar (-)"
        >
          <ZoomOut size={15} />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm transition-colors"
          title="Centralizar Grafo"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Graph Info Badge (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-border-light/80 dark:border-border-dark/80 bg-surface-light/75 dark:bg-surface-dark/75 backdrop-blur text-[11px] text-zinc-400 font-mono pointer-events-none">
        <Info size={11} />
        <span>Arraste os nós • Use o scroll para zoom • Clique no nó para ver o mapa</span>
      </div>

      {/* Modal / Inspector: Mapa do Documento & Estrutura Filtrada */}
      {inspectedNode && inspectedDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/55 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setInspectedNode(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-border-light dark:border-border-dark flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: inspectedNode.color }}
                  />
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                    {inspectedNode.category}
                  </span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {inspectedDoc.readTimeMinutes} min de leitura ({inspectedDoc.wordCount.toLocaleString('pt-BR')} palavras)
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-50 leading-snug">
                  {inspectedDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectedNode(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-zinc-600 dark:text-zinc-400">
              {/* Contexto / Excerpt */}
              {inspectedDoc.excerpt && (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-border-light dark:border-border-dark leading-relaxed">
                  <span className="block font-semibold text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                    Contexto do Documento
                  </span>
                  <p className="text-zinc-800 dark:text-zinc-200 text-xs">{inspectedDoc.excerpt}</p>
                </div>
              )}

              {/* Estrutura de Tópicos (Outline / Headings) */}
              {inspectedDoc.headings.length > 0 && (
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <Layers size={13} />
                    Estrutura de Tópicos ({inspectedDoc.headings.filter((h) => h.level <= 3).length} seções)
                  </h4>
                  <div className="p-3 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-zinc-900/30 space-y-1.5 max-h-44 overflow-y-auto">
                    {inspectedDoc.headings
                      .filter((h) => h.level === 2 || h.level === 3)
                      .map((h, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-2 py-0.5 ${
                            h.level === 3 ? 'pl-4 text-zinc-500' : 'text-zinc-800 dark:text-zinc-200 font-medium'
                          }`}
                        >
                          <span className="text-zinc-400 shrink-0 text-[10px] font-mono mt-0.5">
                            {h.level === 2 ? '§' : '•'}
                          </span>
                          <span className="leading-snug">{h.text}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Mapa de Conexões no Grafo */}
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Network size={13} />
                    Documentos Conectados ({connectedNeighborNodes.length})
                  </span>
                  <span className="text-[10px] text-zinc-400 font-normal">
                    Clique em qualquer um para explorar
                  </span>
                </h4>

                {connectedNeighborNodes.length === 0 ? (
                  <p className="text-zinc-400 text-xs italic">Nenhuma conexão direta mapeada para este nó.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {connectedNeighborNodes.map((neighbor) => (
                      <button
                        key={neighbor.id}
                        onClick={() => setInspectedNode(neighbor)}
                        className="p-2.5 rounded-xl border border-border-light dark:border-border-dark hover:border-zinc-400 dark:hover:border-zinc-600 bg-surface-light dark:bg-zinc-900/40 text-left transition-all group flex items-start gap-2.5"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0 mt-1"
                          style={{ backgroundColor: neighbor.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-400 block truncate">
                            {neighbor.category}
                          </span>
                          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white line-clamp-1">
                            {neighbor.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-border-light dark:border-border-dark flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  focusOnNode(inspectedNode);
                  setInspectedNode(null);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                title="Centralizar e aproximar a câmera neste nó no grafo"
              >
                <Crosshair size={14} />
                <span>Focar no Grafo</span>
              </button>

              <button
                onClick={() => {
                  onSelectDoc(inspectedNode.id);
                  setInspectedNode(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                <BookOpen size={14} />
                <span>Ler Documento Completo</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
