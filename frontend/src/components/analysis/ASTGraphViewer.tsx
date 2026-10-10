import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { ASTNode } from "../../types";

interface ASTGraphViewerProps {
  tree?: ASTNode;
}

export const ASTGraphViewer: React.FC<ASTGraphViewerProps> = ({ tree }) => {
  const { nodes, edges } = useMemo(() => {
    if (!tree) return { nodes: [], edges: [] };

    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    let yOffset = 50;

    const traverse = (node: ASTNode, parentId?: string, depth = 0, xIndex = 0) => {
      const nodeId = node.id || `node-${Math.random()}`;
      const x = depth * 220 + 40;
      const y = yOffset;
      yOffset += 70;

      flowNodes.push({
        id: nodeId,
        data: {
          label: (
            <div className="text-left font-mono text-xs">
              <div className="font-bold text-brand-700">{node.type}</div>
              <div className="text-slate-600 truncate max-w-[160px]">{node.label}</div>
              {node.line && (
                <div className="text-[10px] text-slate-400">line {node.line}</div>
              )}
            </div>
          ),
        },
        position: { x, y },
        style: {
          background: "#FFFFFF",
          border: "1px solid #CBD5E1",
          borderRadius: "8px",
          padding: "8px 12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          width: 180,
        },
      });

      if (parentId) {
        flowEdges.push({
          id: `edge-${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, color: "#94A3B8" },
          style: { stroke: "#94A3B8" },
        });
      }

      if (node.children) {
        node.children.forEach((child, idx) => {
          traverse(child, nodeId, depth + 1, idx);
        });
      }
    };

    traverse(tree);
    return { nodes: flowNodes, edges: flowEdges };
  }, [tree]);

  if (!tree) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No AST tree generated for current input.
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
