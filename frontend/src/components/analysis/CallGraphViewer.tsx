import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { CallGraph } from "../../types";

interface CallGraphViewerProps {
  graph?: CallGraph;
}

export const CallGraphViewer: React.FC<CallGraphViewerProps> = ({ graph }) => {
  const { nodes, edges } = useMemo(() => {
    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      return { nodes: [], edges: [] };
    }

    const flowNodes: Node[] = graph.nodes.map((n) => ({
      id: n.id,
      position: n.position || { x: 50, y: 50 },
      data: {
        label: (
          <div className="text-left font-mono text-xs">
            <div className="font-bold text-indigo-700 flex items-center justify-between">
              <span>{n.data.label}()</span>
              <span className="text-[10px] text-slate-400 font-sans">
                {n.data.params} args
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              lines {n.data.line}?{n.data.endLine}
            </div>
          </div>
        ),
      },
      style: {
        background: "#FFFFFF",
        border: "1px solid #C7D2FE",
        borderRadius: "8px",
        padding: "10px 14px",
        boxShadow: "0 2px 4px rgba(67, 56, 202, 0.08)",
        width: 190,
      },
    }));

    const flowEdges: Edge[] = graph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label || "calls",
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: "#4338CA" },
      style: { stroke: "#4338CA", strokeWidth: 1.5 },
      labelStyle: { fill: "#4338CA", fontSize: 10, fontWeight: 600 },
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [graph]);

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
        <p>No function call relationships extracted.</p>
        <p className="text-xs text-slate-400 mt-1">
          Defined functions must call one another in source code to generate edges.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[460px] w-full border border-slate-200 rounded-lg overflow-hidden bg-slate-50 relative">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#E2E8F0" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
