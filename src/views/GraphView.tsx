import React from "react";
import { GraphData, GraphNode } from "../types";
import { KnowledgeGraph } from "../components/KnowledgeGraph";

interface GraphViewProps {
  graphData: GraphData;
  onSelectNode: (node: GraphNode) => void;
}

export const GraphView: React.FC<GraphViewProps> = ({
  graphData,
  onSelectNode
}) => {
  return (
    <div className="space-y-8 pb-16">
      <KnowledgeGraph
        graphData={graphData}
        onSelectNode={onSelectNode}
      />
    </div>
  );
};
