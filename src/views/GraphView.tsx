import React from "react";
import { GraphData, GraphNode, Resource } from "../types";
import { KnowledgeGraph } from "../components/KnowledgeGraph";

interface GraphViewProps {
  graphData: GraphData;
  resources?: Resource[];
  onNavigateNode?: (node: GraphNode) => void;
  onSelectNode?: (node: GraphNode | null) => void;
}

export const GraphView: React.FC<GraphViewProps> = ({
  graphData,
  resources,
  onNavigateNode,
  onSelectNode,
}) => {
  return (
    <div className="space-y-8 pb-16">
      <KnowledgeGraph
        graphData={graphData}
        resources={resources}
        onNavigateNode={onNavigateNode}
        onSelectNode={onSelectNode}
      />
    </div>
  );
};

