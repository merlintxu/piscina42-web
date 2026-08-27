import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GraphData, GraphNode } from "../types";
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  ArrowRight,
  Move,
  Sparkles,
  Layers,
  HelpCircle,
  Compass
} from "lucide-react";

interface KnowledgeGraphProps {
  graphData: GraphData;
  onSelectNode?: (node: GraphNode) => void;
}

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned?: boolean;
}

/* =========================================================================
 * IMPLEMENTACIÓN ANTERIOR (POSICIONAMIENTO EN ANILLOS / CONCÉNTRICO)
 * Guardada para poder volver atrás si se requiere según especificación.
 * =========================================================================
 * const initRingPositions = (graphData: GraphData) => {
 *   const positions: Record<string, { x: number; y: number; vx: number; vy: number }> = {};
 *   const phases = graphData.nodes.filter(n => n.type === "phase");
 *   const modules = graphData.nodes.filter(n => n.type === "module");
 *   const challenges = graphData.nodes.filter(n => n.type === "challenge");
 *   const others = graphData.nodes.filter(n => !["phase", "module", "challenge"].includes(n.type));
 *
 *   // Arrange phases in center
 *   phases.forEach((p, idx) => {
 *     const angle = (idx / Math.max(1, phases.length)) * Math.PI * 2;
 *     positions[p.id] = {
 *       x: 400 + Math.cos(angle) * 120,
 *       y: 300 + Math.sin(angle) * 120,
 *       vx: 0,
 *       vy: 0,
 *     };
 *   });
 *
 *   // Arrange modules in a middle ring
 *   modules.forEach((m, idx) => {
 *     const angle = (idx / Math.max(1, modules.length)) * Math.PI * 2 + 0.3;
 *     positions[m.id] = {
 *       x: 400 + Math.cos(angle) * 250,
 *       y: 300 + Math.sin(angle) * 250,
 *       vx: 0,
 *       vy: 0,
 *     };
 *   });
 *
 *   // Arrange challenges in an outer ring
 *   challenges.forEach((c, idx) => {
 *     const angle = (idx / Math.max(1, challenges.length)) * Math.PI * 2 + (idx % 2 === 0 ? 0.1 : -0.1);
 *     const radius = 380 + (idx % 3) * 60;
 *     positions[c.id] = {
 *       x: 400 + Math.cos(angle) * radius,
 *       y: 300 + Math.sin(angle) * radius,
 *       vx: 0,
 *       vy: 0,
 *     };
 *   });
 *
 *   // Arrange others
 *   others.forEach((o, idx) => {
 *     const angle = (idx / Math.max(1, others.length)) * Math.PI * 2;
 *     positions[o.id] = {
 *       x: 400 + Math.cos(angle) * 320,
 *       y: 300 + Math.sin(angle) * 320,
 *       vx: 0,
 *       vy: 0,
 *     };
 *   });
 *   return positions;
 * };
 * ========================================================================= */

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  graphData,
  onSelectNode
}) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Dragging interaction state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Simulation state
  const positionsRef = useRef<Record<string, NodePosition>>({});
  const [, setRenderTrigger] = useState(0); // Trigger React re-render when needed
  const animFrameIdRef = useRef<number | null>(null);
  const alphaRef = useRef<number>(1.0); // Simulation temperature / cooling

  const nodeColors: Record<string, { bg: string; border: string; glow: string }> = {
    phase: { bg: "#4CAF50", border: "#2e7d32", glow: "rgba(76, 175, 80, 0.4)" },
    module: { bg: "#03A9F4", border: "#0288d1", glow: "rgba(3, 169, 244, 0.4)" },
    challenge: { bg: "#ab47bc", border: "#7b1fa2", glow: "rgba(171, 71, 188, 0.4)" },
    resource: { bg: "#26a69a", border: "#00796b", glow: "rgba(38, 166, 154, 0.4)" },
    habit: { bg: "#FFC107", border: "#ffa000", glow: "rgba(255, 193, 7, 0.4)" },
    exam: { bg: "#ff5722", border: "#e64a19", glow: "rgba(255, 87, 34, 0.4)" },
  };

  const getNodeRadius = (type: string) => {
    switch (type) {
      case "phase":
        return 24;
      case "module":
        return 18;
      case "challenge":
        return 12;
      case "exam":
        return 16;
      case "habit":
        return 14;
      case "resource":
        return 13;
      default:
        return 12;
    }
  };

  // Reheat physics simulation
  const reheatSimulation = useCallback((initialAlpha = 0.5) => {
    alphaRef.current = Math.max(alphaRef.current, initialAlpha);
  }, []);

  // Initialize nodes with clustered force-directed start
  useEffect(() => {
    if (!graphData.nodes || graphData.nodes.length === 0) return;

    const initialPositions: Record<string, NodePosition> = {};
    const total = graphData.nodes.length;
    const centerX = 450;
    const centerY = 320;

    // Group nodes loosely by phase/type to give force simulation a pleasant initial layout
    graphData.nodes.forEach((node, idx) => {
      const existing = positionsRef.current[node.id];
      if (existing) {
        initialPositions[node.id] = existing;
      } else {
        // Distribute in a golden spiral with slight random jitter
        const angle = idx * 2.39996; // Golden angle
        const radius = 40 + Math.sqrt(idx / Math.max(1, total)) * 260;
        const jitterX = (Math.random() - 0.5) * 30;
        const jitterY = (Math.random() - 0.5) * 30;

        initialPositions[node.id] = {
          x: centerX + Math.cos(angle) * radius + jitterX,
          y: centerY + Math.sin(angle) * radius + jitterY,
          vx: 0,
          vy: 0,
        };
      }
    });

    positionsRef.current = initialPositions;
    alphaRef.current = 1.0; // Start fresh simulation
  }, [graphData]);

  // Main Force-Directed Simulation Loop
  useEffect(() => {
    const nodes = graphData.nodes;
    const edges = graphData.edges;
    if (!nodes || nodes.length === 0) return;

    const kRepulsion = 4500; // Coulomb repulsion strength
    const kSpring = 0.045; // Edge spring attraction strength
    const springLength = 95; // Ideal distance between connected nodes
    const kGravity = 0.015; // Center gravity strength
    const damping = 0.86; // Velocity decay
    const centerX = 450;
    const centerY = 320;

    const stepSimulation = () => {
      const alpha = alphaRef.current;
      const positions = positionsRef.current;

      if (alpha > 0.002 || draggedNodeId !== null) {
        // 1. Repulsion between all node pairs (Coulomb force)
        for (let i = 0; i < nodes.length; i++) {
          const u = nodes[i];
          const posU = positions[u.id];
          if (!posU) continue;

          for (let j = i + 1; j < nodes.length; j++) {
            const v = nodes[j];
            const posV = positions[v.id];
            if (!posV) continue;

            const dx = posV.x - posU.x;
            const dy = posV.y - posU.y;
            const distSq = dx * dx + dy * dy + 1;
            const dist = Math.sqrt(distSq);

            if (dist < 420) {
              const force = (kRepulsion / distSq) * alpha;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (!posU.pinned) {
                posU.vx -= fx;
                posU.vy -= fy;
              }
              if (!posV.pinned) {
                posV.vx += fx;
                posV.vy += fy;
              }
            }
          }
        }

        // 2. Spring attraction along edges (Hooke's Law)
        for (let k = 0; k < edges.length; k++) {
          const edge = edges[k];
          const posSrc = positions[edge.source];
          const posTgt = positions[edge.target];

          if (posSrc && posTgt) {
            const dx = posTgt.x - posSrc.x;
            const dy = posTgt.y - posSrc.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
            const displacement = dist - springLength;
            const force = displacement * kSpring * alpha;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (!posSrc.pinned) {
              posSrc.vx += fx;
              posSrc.vy += fy;
            }
            if (!posTgt.pinned) {
              posTgt.vx -= fx;
              posTgt.vy -= fy;
            }
          }
        }

        // 3. Center gravity & Velocity Integration
        for (let i = 0; i < nodes.length; i++) {
          const u = nodes[i];
          const pos = positions[u.id];
          if (!pos || pos.pinned) continue;

          // Pull towards canvas center
          const dx = centerX - pos.x;
          const dy = centerY - pos.y;
          pos.vx += dx * kGravity * alpha;
          pos.vy += dy * kGravity * alpha;

          // Velocity Damping
          pos.vx *= damping;
          pos.vy *= damping;

          // Position step
          pos.x += pos.vx;
          pos.y += pos.vy;
        }

        // Cool down
        alphaRef.current *= 0.965;
      }

      // Render to canvas
      drawCanvas();

      animFrameIdRef.current = requestAnimationFrame(stepSimulation);
    };

    animFrameIdRef.current = requestAnimationFrame(stepSimulation);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [graphData, filterType, searchQuery, selectedNode, zoom, offset, draggedNodeId]);

  // Canvas Drawing Routine
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const positions = positionsRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = "#0b0f19";
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Draw Subtle Grid dots
    ctx.fillStyle = "rgba(42, 47, 60, 0.45)";
    const startX = Math.floor((-offset.x / zoom - 100) / 40) * 40;
    const endX = startX + Math.ceil((rect.width / zoom + 200) / 40) * 40;
    const startY = Math.floor((-offset.y / zoom - 100) / 40) * 40;
    const endY = startY + Math.ceil((rect.height / zoom + 200) / 40) * 40;

    for (let gx = startX; gx < endX; gx += 40) {
      for (let gy = startY; gy < endY; gy += 40) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Determine Visible Nodes based on filters & search
    const visibleNodes = graphData.nodes.filter(n => {
      if (filterType !== "all" && n.type !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q);
      }
      return true;
    });

    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

    // 1. Draw Edges
    graphData.edges.forEach(edge => {
      const srcPos = positions[edge.source];
      const tgtPos = positions[edge.target];

      if (srcPos && tgtPos) {
        const isConnectedToSelected =
          selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);
        const bothVisible = visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);

        if (bothVisible || isConnectedToSelected) {
          ctx.beginPath();
          ctx.moveTo(srcPos.x, srcPos.y);
          ctx.lineTo(tgtPos.x, tgtPos.y);

          if (isConnectedToSelected) {
            ctx.strokeStyle = "#4CAF50";
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Animated light particle along active edge
            const midX = (srcPos.x + tgtPos.x) / 2;
            const midY = (srcPos.y + tgtPos.y) / 2;
            ctx.fillStyle = "#4CAF50";
            ctx.beginPath();
            ctx.arc(midX, midY, 3, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.strokeStyle = "rgba(42, 47, 60, 0.75)";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    });

    // 2. Draw Nodes
    visibleNodes.forEach(node => {
      const pos = positions[node.id];
      if (!pos) return;

      const isSelected = selectedNode?.id === node.id;
      const isConnected =
        selectedNode &&
        graphData.edges.some(
          e =>
            (e.source === selectedNode.id && e.target === node.id) ||
            (e.target === selectedNode.id && e.source === node.id)
        );

      const radius = getNodeRadius(node.type);
      const colors = nodeColors[node.type] || { bg: "#9FA7B8", border: "#4f5b66", glow: "rgba(159, 167, 184, 0.3)" };

      // Outer Selection / Connection Glow Halo
      if (isSelected || isConnected) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + (isSelected ? 9 : 5), 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? colors.glow : "rgba(76, 175, 80, 0.25)";
        ctx.fill();
      }

      // Main Node Circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? "#FFFFFF" : isConnected ? "#4CAF50" : colors.bg;
      ctx.fill();

      // Border Ring
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.strokeStyle = isSelected ? "#4CAF50" : colors.border;
      ctx.stroke();

      // Label Rendering
      const shouldDrawLabel =
        zoom > 0.65 || isSelected || isConnected || node.type === "phase" || node.type === "module";

      if (shouldDrawLabel) {
        ctx.fillStyle = isSelected ? "#4CAF50" : isConnected ? "#A5D6A7" : "#ECEFF4";
        ctx.font = `${isSelected ? "bold 12px" : "11px"} Inter, monospace`;
        ctx.textAlign = "center";
        const labelText = node.label.length > 22 ? node.label.substring(0, 20) + "..." : node.label;
        ctx.fillText(labelText, pos.x, pos.y + radius + 15);
      }
    });

    ctx.restore();
  };

  // Convert mouse screen coordinate to Canvas World coordinate
  const getWorldCoord = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const mouseX = (clientX - rect.left - offset.x) / zoom;
    const mouseY = (clientY - rect.top - offset.y) / zoom;
    return { x: mouseX, y: mouseY };
  };

  // Find node under mouse
  const findNodeAt = (worldX: number, worldY: number): GraphNode | null => {
    const positions = positionsRef.current;
    for (let i = graphData.nodes.length - 1; i >= 0; i--) {
      const node = graphData.nodes[i];
      const pos = positions[node.id];
      if (pos) {
        const radius = getNodeRadius(node.type) + 4;
        const dist = Math.hypot(worldX - pos.x, worldY - pos.y);
        if (dist <= radius) {
          return node;
        }
      }
    }
    return null;
  };

  // Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getWorldCoord(e.clientX, e.clientY);
    const clickedNode = findNodeAt(x, y);

    if (clickedNode) {
      // Start dragging specific node
      setDraggedNodeId(clickedNode.id);
      const pos = positionsRef.current[clickedNode.id];
      if (pos) {
        pos.pinned = true;
        pos.vx = 0;
        pos.vy = 0;
      }
      setSelectedNode(clickedNode);
      if (onSelectNode) {
        onSelectNode(clickedNode);
      }
      reheatSimulation(0.6);
    } else {
      // Start panning whole canvas
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      const { x, y } = getWorldCoord(e.clientX, e.clientY);
      const pos = positionsRef.current[draggedNodeId];
      if (pos) {
        pos.x = x;
        pos.y = y;
        pos.vx = 0;
        pos.vy = 0;
      }
      reheatSimulation(0.3);
    } else if (isPanning) {
      setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => {
    if (draggedNodeId) {
      const pos = positionsRef.current[draggedNodeId];
      if (pos) {
        pos.pinned = false; // Release pin so physics can stabilize
      }
      setDraggedNodeId(null);
      reheatSimulation(0.3);
    }
    setIsPanning(false);
  };

  // Wheel Zoom support
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.3), 3.0));
  };

  const handleNavigateToNode = (node: GraphNode) => {
    if (onSelectNode) {
      onSelectNode(node);
    } else {
      if (node.type === "phase") {
        navigate(`/phase/${node.id}`);
      } else if (node.type === "module") {
        navigate(`/module/${node.id}`);
      } else if (node.type === "challenge") {
        navigate(`/challenge/${node.id}`);
      } else if (node.type === "exam") {
        navigate("/exams");
      } else if (node.type === "habit") {
        navigate("/habits");
      }
    }
  };

  const handleResetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    reheatSimulation(0.8);
  };

  return (
    <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-6 shadow-xl space-y-4">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#03A9F4]" />
            <h3 className="text-xl font-bold text-[#ECEFF4]">Grafo de Conocimiento & Relaciones</h3>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#03A9F4]/15 text-[#03A9F4] border border-[#03A9F4]/30 rounded flex items-center gap-1">
              <Compass className="w-3 h-3" />
              Force-Directed Layout
            </span>
          </div>
          <p className="text-xs text-[#9FA7B8] mt-0.5">
            Grafo interactivo con física de fuerzas: arrastra nodos, haz zoom, filtra por tipo y navega entre módulos y retos.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {["all", "phase", "module", "challenge", "resource", "habit", "exam"].map(type => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type);
                reheatSimulation(0.4);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all border cursor-pointer ${
                filterType === type
                  ? "bg-[#4CAF50] text-[#0b0f19] border-[#4CAF50] font-bold shadow-md shadow-[#4CAF50]/20"
                  : "bg-[#0b0f19] border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4]"
              }`}
            >
              {type === "all" ? "Todos" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Canvas View Toolbar */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#9FA7B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              reheatSimulation(0.3);
            }}
            placeholder="Buscar por nombre o ID en el grafo..."
            className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#ECEFF4] focus:outline-none focus:border-[#4CAF50]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 2.5))}
            className="p-1.5 bg-[#0b0f19] border border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4] rounded-lg cursor-pointer transition-colors"
            title="Acercar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.4))}
            className="p-1.5 bg-[#0b0f19] border border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4] rounded-lg cursor-pointer transition-colors"
            title="Alejar"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 bg-[#0b0f19] border border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4] rounded-lg cursor-pointer transition-colors"
            title="Restablecer vista y estabilizar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="relative w-full h-[580px] bg-[#0b0f19] border border-[#2A2F3C] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* Instructions pill overlay */}
        <div className="absolute top-3 left-3 bg-[#141927]/90 border border-[#2A2F3C] px-2.5 py-1 rounded-lg text-[10px] font-mono text-[#9FA7B8] backdrop-blur-sm pointer-events-none flex items-center gap-1.5">
          <Move className="w-3 h-3 text-[#03A9F4]" />
          <span>Arrastra nodos o fondo · Rueda para zoom</span>
        </div>

        {/* Selected Node Floating Details Bar */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md bg-[#141927]/95 border border-[#4CAF50] rounded-xl p-4 shadow-2xl backdrop-blur-md animate-fadeIn z-10">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30 rounded font-bold">
                {selectedNode.type}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-[#9FA7B8] hover:text-[#ECEFF4] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <h4 className="font-bold text-sm text-[#ECEFF4] mb-1">{selectedNode.label}</h4>
            <p className="text-xs font-mono text-[#9FA7B8] mb-3">ID: {selectedNode.id}</p>

            <button
              onClick={() => handleNavigateToNode(selectedNode)}
              className="w-full py-2 px-3 bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-[#4CAF50]/20"
            >
              <span>Ver contenido completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
