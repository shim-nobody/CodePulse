"""
CodePulse Function Call Graph Extractor
Generates node and edge models suitable for React Flow rendering.
"""
import ast
from typing import Dict, Any, List

class CallGraphExtractor:
    @staticmethod
    def extract(tree: ast.AST) -> Dict[str, Any]:
        functions: Dict[str, Any] = {}
        calls: List[tuple[str, str]] = []

        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                functions[node.name] = node

        for caller_name, func_node in functions.items():
            for subnode in ast.walk(func_node):
                if isinstance(subnode, ast.Call):
                    callee_name = None
                    if isinstance(subnode.func, ast.Name):
                        callee_name = subnode.func.id
                    elif isinstance(subnode.func, ast.Attribute):
                        callee_name = subnode.func.attr
                    
                    if callee_name and callee_name in functions:
                        calls.append((caller_name, callee_name))

        nodes = []
        edges = []
        
        fn_names = list(functions.keys())
        for idx, name in enumerate(fn_names):
            col = idx % 3
            row = idx // 3
            fn_node = functions[name]
            nodes.append({
                "id": name,
                "data": {
                    "label": name,
                    "line": fn_node.lineno,
                    "endLine": getattr(fn_node, "end_lineno", fn_node.lineno),
                    "params": len(fn_node.args.args)
                },
                "position": {"x": col * 260 + 50, "y": row * 130 + 50},
                "type": "customNode"
            })

        for idx, (source, target) in enumerate(set(calls)):
            edges.append({
                "id": f"edge-{idx}-{source}-{target}",
                "source": source,
                "target": target,
                "label": "calls",
                "animated": True
            })

        return {"nodes": nodes, "edges": edges}
