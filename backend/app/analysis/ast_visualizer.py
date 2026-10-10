"""
CodePulse AST Hierarchy Tree Builder for UI Visualizer
"""
import ast
from typing import Dict, Any, Optional

class ASTVisualizer:
    @classmethod
    def to_tree(cls, node: ast.AST, max_depth: int = 5, current_depth: int = 0) -> Dict[str, Any]:
        node_type = type(node).__name__
        label = node_type
        line = getattr(node, "lineno", None)
        
        details: Dict[str, Any] = {}
        if isinstance(node, ast.FunctionDef):
            label = f"def {node.name}()"
            details["name"] = node.name
        elif isinstance(node, ast.ClassDef):
            label = f"class {node.name}"
            details["name"] = node.name
        elif isinstance(node, ast.Name):
            label = f"Name: {node.id}"
            details["id"] = node.id
        elif isinstance(node, ast.Constant):
            label = f"Const: {repr(node.value)}"
            details["value"] = str(node.value)
        elif isinstance(node, (ast.For, ast.While)):
            label = f"Loop: {node_type}"
        elif isinstance(node, ast.If):
            label = "Condition: If"

        children = []
        if current_depth < max_depth:
            for child in ast.iter_child_nodes(node):
                children.append(cls.to_tree(child, max_depth=max_depth, current_depth=current_depth + 1))

        return {
            "id": f"{node_type}-{line or 0}-{id(node)}",
            "label": label,
            "type": node_type,
            "line": line,
            "details": details,
            "children": children
        }
