import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GraphData, GraphNode, Resource } from "../types";
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  ArrowRight,
  ExternalLink,
  Move,
  Compass,
  Filter,
  Check,
  Eye,
  EyeOff,
  Crosshair,
  X,
  Link2,
  BookOpen,
  Terminal,
  Code2,
  Flame,
  Clock,
  Globe,
  Layers
} from "lucide-react";

export interface KnowledgeGraphProps {
  graphData: GraphData;
  resources?: Resource[];
  onNavigateNode?: (node: GraphNode) => void;
  onSelectNode?: (node: GraphNode | null) => void;
}

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned?: boolean;
}

interface NodeNeighbor {
  node: GraphNode;
  rel: string;
  direction: "outgoing" | "incoming";
}

const ALL_NODE_TYPES = ["phase", "module", "challenge", "resource", "habit", "exam"] as const;
type NodeType = (typeof ALL_NODE_TYPES)[number];

const typeLabels: Record<string, string> = {
  phase: "Fase",
  module: "Módulo",
  challenge: "Reto",
  resource: "Recurso",
  habit: "Hábito",
  exam: "Examen",
};

const relationLabels: Record<string, string> = {
  "has-module": "Contiene módulo",
  "has-challenge": "Contiene reto",
  "has-resource": "Recurso vinculado",
  "has-habit": "Hábito asociado",
  "in-phase": "En fase",
  "in-module": "En módulo",
  "for-module": "Para módulo",
  "for-phase": "Para fase",
  "uses-challenge": "Usa reto",
};

const nodeColors: Record<string, { bg: string; border: string; glow: string; text: string; lightBg: string }> = {
  phase: { bg: "#4CAF50", border: "#2e7d32", glow: "rgba(76, 175, 80, 0.45)", text: "#4CAF50", lightBg: "rgba(76, 175, 80, 0.15)" },
  module: { bg: "#03A9F4", border: "#0288d1", glow: "rgba(3, 169, 244, 0.45)", text: "#03A9F4", lightBg: "rgba(3, 169, 244, 0.15)" },
  challenge: { bg: "#ab47bc", border: "#7b1fa2", glow: "rgba(171, 71, 188, 0.45)", text: "#ab47bc", lightBg: "rgba(171, 71, 188, 0.15)" },
  resource: { bg: "#26a69a", border: "#00796b", glow: "rgba(38, 166, 154, 0.45)", text: "#26a69a", lightBg: "rgba(38, 166, 154, 0.15)" },
  habit: { bg: "#FFC107", border: "#ffa000", glow: "rgba(255, 193, 7, 0.45)", text: "#FFC107", lightBg: "rgba(255, 193, 7, 0.15)" },
  exam: { bg: "#ff5722", border: "#e64a19", glow: "rgba(255, 87, 34, 0.45)", text: "#ff5722", lightBg: "rgba(255, 87, 34, 0.15)" },
};

const getNodeRadius = (type: string): number => {
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

const getTypeIcon = (type: string) => {
  switch (type) {
    case "phase":
      return <BookOpen className="w-3.5 h-3.5" />;
    case "module":
      return <Terminal className="w-3.5 h-3.5" />;
    case "challenge":
      return <Code2 className="w-3.5 h-3.5" />;
    case "resource":
      return <Globe className="w-3.5 h-3.5" />;
    case "habit":
      return <Flame className="w-3.5 h-3.5" />;
    case "exam":
      return <Clock className="w-3.5 h-3.5" />;
    default:
      return <Share2 className="w-3.5 h-3.5" />;
  }
};

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  graphData,
  resources,
  onNavigateNode,
  onSelectNode,
}) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Multi-selection filter state (all active by default)
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(ALL_NODE_TYPES)
  );

  // Neighborhood-only mode
  const [onlyNeighborhood, setOnlyNeighborhood] = useState(false);

  // Search & Selection
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Hover Tooltip state
  const [hoveredNodeInfo, setHoveredNodeInfo] = useState<{
    node: GraphNode;
    x: number;
    y: number;
  } | null>(null);

  // Transform / Camera
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Mouse interaction state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const hasMovedWhileDraggingRef = useRef(false);

  // Physics Simulation state
  const positionsRef = useRef<Record<string, NodePosition>>({});
  const animFrameIdRef = useRef<number | null>(null);
  const alphaRef = useRef<number>(1.0); // Temperature / cooling

  // 1. Fast Node Lookup Map (useMemo)
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    (graphData.nodes || []).forEach((n) => map.set(n.id, n));
    return map;
  }, [graphData.nodes]);

  // 2. Adjacency Index (useMemo)
  const adjacencyMap = useMemo(() => {
    const map = new Map<string, NodeNeighbor[]>();
    (graphData.nodes || []).forEach((n) => map.set(n.id, []));

    (graphData.edges || []).forEach((edge) => {
      const srcNode = nodeMap.get(edge.source);
      const tgtNode = nodeMap.get(edge.target);

      if (srcNode && tgtNode) {
        map.get(edge.source)?.push({
          node: tgtNode,
          rel: edge.rel,
          direction: "outgoing",
        });
        map.get(edge.target)?.push({
          node: srcNode,
          rel: edge.rel,
          direction: "incoming",
        });
      }
    });

    return map;
  }, [graphData.nodes, graphData.edges, nodeMap]);

  // 3. Direct Neighbor IDs for selected node (useMemo)
  const selectedNeighborIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const neighbors = adjacencyMap.get(selectedNode.id) || [];
    const set = new Set<string>();
    neighbors.forEach((nbr) => set.add(nbr.node.id));
    return set;
  }, [selectedNode, adjacencyMap]);

  // Direct neighbor list for selected node details panel
  const selectedNeighborsList = useMemo(() => {
    if (!selectedNode) return [];
    return adjacencyMap.get(selectedNode.id) || [];
  }, [selectedNode, adjacencyMap]);

  // 4. Type count statistics
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      phase: 0,
      module: 0,
      challenge: 0,
      resource: 0,
      habit: 0,
      exam: 0,
    };
    (graphData.nodes || []).forEach((n) => {
      if (counts[n.type] !== undefined) {
        counts[n.type]++;
      }
    });
    return counts;
  }, [graphData.nodes]);

  // 5. Search matches (memoized)
  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return (graphData.nodes || [])
      .filter((n) => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q))
      .slice(0, 8);
  }, [graphData.nodes, searchQuery]);

  // Reheat physics simulation helper
  const reheatSimulation = useCallback((initialAlpha = 0.5) => {
    alphaRef.current = Math.max(alphaRef.current, initialAlpha);
  }, []);

  // Initialize node coordinates with golden spiral
  useEffect(() => {
    if (!graphData.nodes || graphData.nodes.length === 0) return;

    const initialPositions: Record<string, NodePosition> = {};
    const total = graphData.nodes.length;
    const centerX = 460;
    const centerY = 320;

    graphData.nodes.forEach((node, idx) => {
      const existing = positionsRef.current[node.id];
      if (existing) {
        initialPositions[node.id] = existing;
      } else {
        const angle = idx * 2.39996; // Golden angle
        const radius = 45 + Math.sqrt(idx / Math.max(1, total)) * 270;
        const jitterX = (Math.random() - 0.5) * 35;
        const jitterY = (Math.random() - 0.5) * 35;

        initialPositions[node.id] = {
          x: centerX + Math.cos(angle) * radius + jitterX,
          y: centerY + Math.sin(angle) * radius + jitterY,
          vx: 0,
          vy: 0,
        };
      }
    });

    positionsRef.current = initialPositions;
    alphaRef.current = 1.0;
  }, [graphData]);

  // Center camera on a specific node with smooth coordinates
  const centerOnNode = useCallback((node: GraphNode, targetZoom = 1.25) => {
    const pos = positionsRef.current[node.id];
    const container = containerRef.current;
    if (!pos || !container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 580;

    const newOffsetX = width / 2 - pos.x * targetZoom;
    const newOffsetY = height / 2 - pos.y * targetZoom;

    setZoom(targetZoom);
    setOffset({ x: newOffsetX, y: newOffsetY });
    reheatSimulation(0.35);
  }, [reheatSimulation]);

  // Center and select a node from search match
  const handleSelectSearchMatch = (node: GraphNode) => {
    setSelectedNode(node);
    if (onSelectNode) {
      onSelectNode(node);
    }
    centerOnNode(node, 1.3);
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  // Center and select a neighbor from detail panel list
  const handleSelectNeighbor = (neighborNode: GraphNode) => {
    setSelectedNode(neighborNode);
    if (onSelectNode) {
      onSelectNode(neighborNode);
    }
    centerOnNode(neighborNode, zoom);
  };

  // Explicit CTA: Navigate to full content
  const handleOpenContent = (node: GraphNode) => {
    if (node.type === "resource") {
      const resObj = resources?.find((r) => r.id === node.id);
      if (resObj?.url) {
        window.open(resObj.url, "_blank", "noopener,noreferrer");
        return;
      }
    }

    if (onNavigateNode) {
      onNavigateNode(node);
    } else {
      if (node.type === "phase") {
        navigate(`/phase/${node.slug || node.id}`);
      } else if (node.type === "module") {
        navigate(`/module/${node.slug || node.id}`);
      } else if (node.type === "challenge") {
        navigate(`/challenge/${node.slug || node.id}`);
      } else if (node.type === "exam") {
        navigate("/exams");
      } else if (node.type === "habit") {
        navigate("/habits");
      }
    }
  };

  // Filter toggle helpers
  const handleToggleType = (type: NodeType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) {
          next.delete(type);
        }
      } else {
        next.add(type);
      }
      return next;
    });
    reheatSimulation(0.35);
  };

  const handleSelectAllTypes = () => {
    if (selectedTypes.size === ALL_NODE_TYPES.length) {
      // If all are selected, keep all or don't empty
      setSelectedTypes(new Set(ALL_NODE_TYPES));
    } else {
      setSelectedTypes(new Set(ALL_NODE_TYPES));
    }
    reheatSimulation(0.35);
  };

  // Main Force-Directed Simulation Loop & Canvas Rendering
  useEffect(() => {
    const nodes = graphData.nodes;
    const edges = graphData.edges;
    if (!nodes || nodes.length === 0) return;

    const kRepulsion = 4600;
    const kSpring = 0.046;
    const springLength = 98;
    const kGravity = 0.016;
    const damping = 0.86;
    const centerX = 460;
    const centerY = 320;

    const stepSimulation = () => {
      const alpha = alphaRef.current;
      const positions = positionsRef.current;

      if (alpha > 0.002 || draggedNodeId !== null) {
        // 1. Repulsion between all node pairs
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

            if (dist < 440) {
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

        // 2. Spring attraction along edges
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

          const dx = centerX - pos.x;
          const dy = centerY - pos.y;
          pos.vx += dx * kGravity * alpha;
          pos.vy += dy * kGravity * alpha;

          pos.vx *= damping;
          pos.vy *= damping;

          pos.x += pos.vx;
          pos.y += pos.vy;
        }

        // Cool down
        alphaRef.current *= 0.965;
      }

      // Draw frame to canvas
      drawCanvas();

      animFrameIdRef.current = requestAnimationFrame(stepSimulation);
    };

    animFrameIdRef.current = requestAnimationFrame(stepSimulation);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    graphData,
    selectedTypes,
    selectedNode,
    selectedNeighborIds,
    onlyNeighborhood,
    zoom,
    offset,
    draggedNodeId,
    hoveredNodeInfo,
  ]);

  // High-performance Canvas Rendering Routine
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

    // Subtle Grid dots
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

    const hasSelected = selectedNode !== null;
    const isNeighborhoodActive = onlyNeighborhood && hasSelected;

    // 1. Draw Edges
    const edges = graphData.edges || [];
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const srcPos = positions[edge.source];
      const tgtPos = positions[edge.target];
      if (!srcPos || !tgtPos) continue;

      const srcType = nodeMap.get(edge.source)?.type;
      const tgtType = nodeMap.get(edge.target)?.type;
      const bothTypesActive = srcType && tgtType && selectedTypes.has(srcType) && selectedTypes.has(tgtType);

      const isConnectedToSelected =
        hasSelected && (edge.source === selectedNode.id || edge.target === selectedNode.id);

      if (isNeighborhoodActive) {
        // Only draw edges involving selected node or between its direct neighbors
        if (isConnectedToSelected) {
          ctx.beginPath();
          ctx.moveTo(srcPos.x, srcPos.y);
          ctx.lineTo(tgtPos.x, tgtPos.y);
          ctx.strokeStyle = "#4CAF50";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Particle on active link
          const midX = (srcPos.x + tgtPos.x) / 2;
          const midY = (srcPos.y + tgtPos.y) / 2;
          ctx.fillStyle = "#4CAF50";
          ctx.beginPath();
          ctx.arc(midX, midY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        if (bothTypesActive || isConnectedToSelected) {
          ctx.beginPath();
          ctx.moveTo(srcPos.x, srcPos.y);
          ctx.lineTo(tgtPos.x, tgtPos.y);

          if (isConnectedToSelected) {
            ctx.strokeStyle = "#4CAF50";
            ctx.lineWidth = 2.5;
            ctx.stroke();

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
    }

    // 2. Draw Nodes
    const nodes = graphData.nodes || [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const pos = positions[node.id];
      if (!pos) continue;

      const isTypeActive = selectedTypes.has(node.type);
      const isSelected = selectedNode?.id === node.id;
      const isConnected = selectedNeighborIds.has(node.id);
      const isHovered = hoveredNodeInfo?.node.id === node.id;

      // In Neighborhood mode:
      if (isNeighborhoodActive) {
        if (!isSelected && !isConnected) {
          // Attenuate heavily
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(42, 47, 60, 0.25)";
          ctx.fill();
          continue;
        }
      } else {
        if (!isTypeActive && !isSelected && !isConnected) {
          continue;
        }
      }

      const radius = getNodeRadius(node.type);
      const colors = nodeColors[node.type] || {
        bg: "#9FA7B8",
        border: "#4f5b66",
        glow: "rgba(159, 167, 184, 0.3)",
      };

      // Halo / Glow
      if (isSelected || isConnected || isHovered) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + (isSelected ? 9 : isHovered ? 6 : 4), 0, Math.PI * 2);
        ctx.fillStyle = isSelected
          ? colors.glow
          : isHovered
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(76, 175, 80, 0.25)";
        ctx.fill();
      }

      // Main Circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? "#FFFFFF" : isConnected ? "#4CAF50" : colors.bg;
      ctx.fill();

      // Border Ring
      ctx.lineWidth = isSelected ? 3 : isHovered ? 2.5 : 1.5;
      ctx.strokeStyle = isSelected ? "#4CAF50" : isHovered ? "#FFFFFF" : colors.border;
      ctx.stroke();

      // Label
      const shouldDrawLabel =
        zoom > 0.65 || isSelected || isConnected || isHovered || node.type === "phase" || node.type === "module";

      if (shouldDrawLabel) {
        ctx.fillStyle = isSelected
          ? "#4CAF50"
          : isConnected
          ? "#A5D6A7"
          : isHovered
          ? "#FFFFFF"
          : "#ECEFF4";
        ctx.font = `${isSelected ? "bold 12px" : "11px"} Inter, monospace`;
        ctx.textAlign = "center";
        const labelText = node.label.length > 22 ? node.label.substring(0, 20) + "..." : node.label;
        ctx.fillText(labelText, pos.x, pos.y + radius + 15);
      }
    }

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

  // Find node under world coordinates
  const findNodeAt = (worldX: number, worldY: number): GraphNode | null => {
    const positions = positionsRef.current;
    const nodes = graphData.nodes || [];
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (!selectedTypes.has(node.type) && selectedNode?.id !== node.id && !selectedNeighborIds.has(node.id)) {
        continue;
      }
      const pos = positions[node.id];
      if (pos) {
        const radius = getNodeRadius(node.type) + 5;
        const dist = Math.hypot(worldX - pos.x, worldY - pos.y);
        if (dist <= radius) {
          return node;
        }
      }
    }
    return null;
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getWorldCoord(e.clientX, e.clientY);
    const clickedNode = findNodeAt(x, y);
    hasMovedWhileDraggingRef.current = false;

    if (clickedNode) {
      setDraggedNodeId(clickedNode.id);
      const pos = positionsRef.current[clickedNode.id];
      if (pos) {
        pos.pinned = true;
        pos.vx = 0;
        pos.vy = 0;
      }
      // Select node purely in state (DO NOT NAVIGATE!)
      setSelectedNode(clickedNode);
      if (onSelectNode) {
        onSelectNode(clickedNode);
      }
      reheatSimulation(0.4);
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (draggedNodeId) {
      hasMovedWhileDraggingRef.current = true;
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
    } else {
      // Hover detection
      const { x, y } = getWorldCoord(e.clientX, e.clientY);
      const hovered = findNodeAt(x, y);
      if (hovered) {
        setHoveredNodeInfo({ node: hovered, x: screenX, y: screenY });
      } else {
        setHoveredNodeInfo(null);
      }
    }
  };

  const handleMouseUp = () => {
    if (draggedNodeId) {
      const pos = positionsRef.current[draggedNodeId];
      if (pos) {
        pos.pinned = false;
      }
      setDraggedNodeId(null);
      reheatSimulation(0.3);
    }
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    handleMouseUp();
    setHoveredNodeInfo(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.35), 3.0));
  };

  const handleResetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    reheatSimulation(0.8);
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-[#141927] border border-[#2A2F3C] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#03A9F4]" />
            <h3 className="text-xl font-bold text-[#ECEFF4]">Grafo de Conocimiento & Relaciones</h3>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#03A9F4]/15 text-[#03A9F4] border border-[#03A9F4]/30 rounded flex items-center gap-1">
              <Compass className="w-3 h-3" />
              Force-Directed Canvas
            </span>
          </div>
          <p className="text-xs text-[#9FA7B8] mt-0.5">
            Explora las dependencias de la piscina: haz click en un nodo para examinar su entorno y conexiones antes de abrir su contenido.
          </p>
        </div>

        {/* Multi-Selection Type Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0b0f19] border border-[#2A2F3C] p-1.5 rounded-xl">
          <button
            id="filter-all-btn"
            onClick={handleSelectAllTypes}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all border cursor-pointer flex items-center gap-1 ${
              selectedTypes.size === ALL_NODE_TYPES.length
                ? "bg-[#4CAF50] text-[#0b0f19] border-[#4CAF50] shadow-sm shadow-[#4CAF50]/20"
                : "bg-[#141927] border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4]"
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Todos</span>
          </button>

          {ALL_NODE_TYPES.map((type) => {
            const isSelected = selectedTypes.has(type);
            const conf = nodeColors[type];
            const count = typeCounts[type] || 0;

            return (
              <button
                key={type}
                id={`filter-${type}-btn`}
                onClick={() => handleToggleType(type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#141927] border-current font-bold"
                    : "bg-[#0b0f19] border-[#2A2F3C] text-[#555E70] hover:text-[#9FA7B8]"
                }`}
                style={{
                  color: isSelected ? conf.text : undefined,
                  borderColor: isSelected ? conf.border : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: isSelected ? conf.bg : "#555E70" }}
                />
                <span>{typeLabels[type]}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar with Autocomplete & Canvas Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Search Autocomplete */}
        <div ref={searchInputRef} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9FA7B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="knowledge-graph-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Buscar por nombre o ID en el grafo..."
            className="w-full bg-[#0b0f19] border border-[#2A2F3C] rounded-xl pl-9 pr-8 py-2 text-xs text-[#ECEFF4] focus:outline-none focus:border-[#03A9F4] transition-colors"
          />

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setIsSearchFocused(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9FA7B8] hover:text-[#ECEFF4] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchMatches.length > 0 && (
            <div
              id="graph-search-dropdown"
              className="absolute left-0 right-0 top-full mt-1.5 bg-[#141927] border border-[#2A2F3C] rounded-xl shadow-2xl overflow-hidden z-30 divide-y divide-[#2A2F3C]/50 max-h-64 overflow-y-auto backdrop-blur-md"
            >
              {searchMatches.map((node) => {
                const conf = nodeColors[node.type];
                return (
                  <button
                    key={node.id}
                    onClick={() => handleSelectSearchMatch(node)}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-[#182035] flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="px-1.5 py-0.5 text-[9px] font-mono uppercase font-bold rounded border shrink-0"
                        style={{
                          color: conf.text,
                          borderColor: conf.border,
                          backgroundColor: conf.lightBg,
                        }}
                      >
                        {typeLabels[node.type] || node.type}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-[#ECEFF4] group-hover:text-[#03A9F4] truncate">
                          {node.label}
                        </div>
                        <div className="text-[10px] font-mono text-[#9FA7B8] truncate">
                          ID: {node.id}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-[#9FA7B8] group-hover:text-[#03A9F4] flex items-center gap-1 shrink-0">
                      <Crosshair className="w-3 h-3" />
                      <span>Centrar</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* View Controls & Environment Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Solo entorno Toggle Button */}
          <button
            id="toggle-only-neighborhood-btn"
            onClick={() => {
              setOnlyNeighborhood((prev) => !prev);
              reheatSimulation(0.4);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border cursor-pointer flex items-center gap-1.5 ${
              onlyNeighborhood
                ? "bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]/40 shadow-sm shadow-[#4CAF50]/10"
                : "bg-[#0b0f19] border-[#2A2F3C] text-[#9FA7B8] hover:text-[#ECEFF4]"
            }`}
            title="Mostrar solo el entorno inmediato (vecinos directos) del nodo seleccionado"
          >
            {onlyNeighborhood ? (
              <Eye className="w-3.5 h-3.5 text-[#4CAF50]" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            <span>Solo entorno</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-[#0b0f19] border border-[#2A2F3C] rounded-xl p-0.5">
            <button
              onClick={() => setZoom((prev) => Math.min(prev + 0.2, 2.8))}
              className="p-1.5 text-[#9FA7B8] hover:text-[#ECEFF4] rounded-lg cursor-pointer transition-colors"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.4))}
              className="p-1.5 text-[#9FA7B8] hover:text-[#ECEFF4] rounded-lg cursor-pointer transition-colors"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 text-[#9FA7B8] hover:text-[#ECEFF4] rounded-lg cursor-pointer transition-colors"
              title="Restablecer cámara y estabilizar layout"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        id="knowledge-graph-canvas-container"
        className="relative w-full h-[620px] bg-[#0b0f19] border border-[#2A2F3C] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* Floating Instructions Banner */}
        <div className="absolute top-3 left-3 bg-[#141927]/90 border border-[#2A2F3C] px-3 py-1.5 rounded-xl text-[11px] font-mono text-[#9FA7B8] backdrop-blur-md pointer-events-none flex items-center gap-2 shadow-lg">
          <Move className="w-3.5 h-3.5 text-[#03A9F4]" />
          <span>Click para seleccionar · Arrastra nodos o fondo · Rueda para zoom</span>
        </div>

        {/* Lightweight Hover Tooltip */}
        {hoveredNodeInfo && !draggedNodeId && (
          <div
            className="absolute pointer-events-none z-20 transition-transform duration-75 ease-out"
            style={{
              left: `${Math.min(hoveredNodeInfo.x + 14, (containerRef.current?.clientWidth || 800) - 220)}px`,
              top: `${Math.max(10, Math.min(hoveredNodeInfo.y - 45, (containerRef.current?.clientHeight || 600) - 90))}px`,
            }}
          >
            <div className="bg-[#141927]/95 border border-[#2A2F3C] rounded-xl px-3 py-2 shadow-2xl backdrop-blur-md max-w-xs space-y-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold rounded border"
                  style={{
                    color: nodeColors[hoveredNodeInfo.node.type]?.text,
                    borderColor: nodeColors[hoveredNodeInfo.node.type]?.border,
                    backgroundColor: nodeColors[hoveredNodeInfo.node.type]?.lightBg,
                  }}
                >
                  {typeLabels[hoveredNodeInfo.node.type] || hoveredNodeInfo.node.type}
                </span>
                <span className="text-[10px] font-mono text-[#9FA7B8]">
                  {adjacencyMap.get(hoveredNodeInfo.node.id)?.length || 0} conexiones
                </span>
              </div>
              <div className="text-xs font-bold text-[#ECEFF4] truncate">
                {hoveredNodeInfo.node.label}
              </div>
              <div className="text-[10px] font-mono text-[#9FA7B8] truncate">
                ID: {hoveredNodeInfo.node.id}
              </div>
            </div>
          </div>
        )}

        {/* Selected Node Floating Detail Panel */}
        {selectedNode && (
          <div
            id="node-detail-panel"
            className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 max-h-[85%] bg-[#141927]/95 border border-[#4CAF50]/50 rounded-2xl p-5 shadow-2xl backdrop-blur-md z-20 flex flex-col justify-between space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Panel Header */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 text-[10px] font-mono uppercase font-bold rounded border flex items-center gap-1"
                    style={{
                      color: nodeColors[selectedNode.type]?.text,
                      borderColor: nodeColors[selectedNode.type]?.border,
                      backgroundColor: nodeColors[selectedNode.type]?.lightBg,
                    }}
                  >
                    {getTypeIcon(selectedNode.type)}
                    <span>{typeLabels[selectedNode.type] || selectedNode.type}</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#9FA7B8] px-2 py-0.5 rounded bg-[#0b0f19] border border-[#2A2F3C]">
                    {selectedNeighborsList.length} conexiones
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => centerOnNode(selectedNode, zoom)}
                    className="p-1 text-[#9FA7B8] hover:text-[#ECEFF4] rounded-lg hover:bg-[#182035] transition-colors cursor-pointer"
                    title="Centrar en el canvas"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedNode(null);
                      if (onSelectNode) onSelectNode(null);
                    }}
                    className="p-1 text-[#9FA7B8] hover:text-[#ECEFF4] rounded-lg hover:bg-[#182035] transition-colors cursor-pointer"
                    title="Cerrar panel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-base text-[#ECEFF4] leading-snug">
                {selectedNode.label}
              </h4>
              <p className="text-xs font-mono text-[#9FA7B8] mt-0.5">
                ID: <span className="text-[#ECEFF4]">{selectedNode.id}</span>
              </p>
            </div>

            {/* Direct Neighbors & Relationships List */}
            <div className="space-y-1.5 flex-1 min-h-0 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#9FA7B8]">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-[#4CAF50]" />
                  <span>Vecinos directos ({selectedNeighborsList.length})</span>
                </span>
                <span className="text-[10px] text-[#555E70]">Click para seleccionar</span>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#2A2F3C]/40">
                {selectedNeighborsList.length > 0 ? (
                  selectedNeighborsList.map((nbr, idx) => {
                    const conf = nodeColors[nbr.node.type] || {
                      text: "#ECEFF4",
                      border: "#2A2F3C",
                      lightBg: "transparent",
                    };
                    const relLabel = relationLabels[nbr.rel] || nbr.rel;

                    return (
                      <button
                        key={`${nbr.node.id}-${idx}`}
                        onClick={() => handleSelectNeighbor(nbr.node)}
                        className="w-full pt-1.5 pb-1 px-2 rounded-lg text-left hover:bg-[#182035] flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: conf.text }}
                          />
                          <div className="truncate">
                            <div className="text-xs font-semibold text-[#ECEFF4] group-hover:text-[#4CAF50] truncate">
                              {nbr.node.label}
                            </div>
                            <div className="text-[10px] font-mono text-[#9FA7B8] truncate">
                              {nbr.node.id}
                            </div>
                          </div>
                        </div>

                        <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-[#0b0f19] border border-[#2A2F3C] text-[#9FA7B8] shrink-0">
                          {relLabel}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-xs font-mono text-[#9FA7B8] py-2 text-center">
                    No tiene conexiones directas registradas.
                  </div>
                )}
              </div>
            </div>

            {/* Explicit Navigation CTA Button: 'Abrir contenido' */}
            <div className="pt-2 border-t border-[#2A2F3C]">
              <button
                id="open-content-cta-btn"
                onClick={() => handleOpenContent(selectedNode)}
                className="w-full py-2.5 px-4 bg-[#4CAF50] hover:bg-[#43a047] text-[#0b0f19] font-bold text-xs font-mono rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#4CAF50]/20 group"
              >
                <span>
                  {selectedNode.type === "resource" ? "Abrir recurso externo" : "Abrir contenido"}
                </span>
                {selectedNode.type === "resource" ? (
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                ) : (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
