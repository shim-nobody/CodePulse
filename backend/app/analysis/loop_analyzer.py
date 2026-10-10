"""
CodePulse Loop Structural & Nesting Analyzer
"""
import ast
from typing import Dict, Any, List

class LoopAnalyzer:
    @staticmethod
    def get_max_nesting_depth(node: ast.AST) -> int:
        def depth(n, current):
            max_d = current
            for child in ast.iter_child_nodes(n):
                next_d = current + 1 if isinstance(child, (ast.For, ast.AsyncFor, ast.While, ast.If, ast.With, ast.Try)) else current
                max_d = max(max_d, depth(child, next_d))
            return max_d
        return depth(node, 0)

    @classmethod
    def analyze_loops(cls, node: ast.AST) -> List[Dict[str, Any]]:
        loops = []
        for subnode in ast.walk(node):
            if isinstance(subnode, (ast.For, ast.While)):
                loop_type = "For" if isinstance(subnode, ast.For) else "While"
                line = getattr(subnode, "lineno", 1)
                
                step_pattern = "linear"
                has_break = False
                has_return = False
                
                for child in ast.walk(subnode):
                    if isinstance(child, ast.Break):
                        has_break = True
                    elif isinstance(child, ast.Return):
                        has_return = True
                    elif isinstance(child, ast.AugAssign):
                        if isinstance(child.op, (ast.FloorDiv, ast.Div, ast.RShift)):
                            step_pattern = "logarithmic"
                        elif isinstance(child.op, (ast.Sub, ast.Add)) and step_pattern != "logarithmic":
                            step_pattern = "linear"
                
                nested_count = 0
                for child in ast.walk(subnode):
                    if child is not subnode and isinstance(child, (ast.For, ast.While)):
                        nested_count += 1

                loops.append({
                    "type": loop_type,
                    "line": line,
                    "nested_loops_count": nested_count,
                    "step_pattern": step_pattern,
                    "has_early_exit": has_break or has_return
                })
        return loops
