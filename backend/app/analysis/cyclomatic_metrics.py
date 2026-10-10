"""
CodePulse Cyclomatic Complexity Analyzer
Calculates McCabe's Cyclomatic Complexity M = E - N + 2P
with support for Radon and AST-level branch evaluation.
"""
import ast
from typing import Dict, Any, List, Tuple
from radon.complexity import cc_visit, cc_rank

class CyclomaticAnalyzer:
    @staticmethod
    def rank_cc(score: int) -> str:
        if score <= 5:
            return "A"
        elif score <= 10:
            return "B"
        elif score <= 20:
            return "C"
        elif score <= 30:
            return "D"
        elif score <= 40:
            return "E"
        return "F"

    @classmethod
    def analyze_function(cls, node: ast.FunctionDef | ast.AsyncFunctionDef) -> Dict[str, Any]:
        """
        Count branches:
        if, while, for, and, or, except, with, listcomp, setcomp, dictcomp, generatorexp, assert
        """
        branches = 1
        branch_details = []

        for subnode in ast.walk(node):
            if isinstance(subnode, (ast.If, ast.While, ast.For, ast.AsyncFor)):
                branches += 1
                branch_details.append({
                    "type": type(subnode).__name__,
                    "line": getattr(subnode, "lineno", node.lineno)
                })
            elif isinstance(subnode, ast.BoolOp):
                # 'and' or 'or' with N values adds N-1 decision points
                count = len(subnode.values) - 1
                branches += count
                branch_details.append({
                    "type": f"BoolOp_{type(subnode.op).__name__}",
                    "line": getattr(subnode, "lineno", node.lineno),
                    "count": count
                })
            elif isinstance(subnode, ast.ExceptHandler):
                branches += 1
                branch_details.append({
                    "type": "ExceptHandler",
                    "line": getattr(subnode, "lineno", node.lineno)
                })
            elif isinstance(subnode, (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
                # Each generator clause in comprehension adds a branch
                branches += len(subnode.generators)
                branch_details.append({
                    "type": type(subnode).__name__,
                    "line": getattr(subnode, "lineno", node.lineno)
                })
            elif isinstance(subnode, ast.Assert):
                branches += 1
                branch_details.append({
                    "type": "Assert",
                    "line": getattr(subnode, "lineno", node.lineno)
                })

        return {
            "score": branches,
            "rank": cls.rank_cc(branches),
            "branch_points": branch_details
        }

    @classmethod
    def analyze_source_radon(cls, source_code: str) -> List[Dict[str, Any]]:
        try:
            results = cc_visit(source_code)
            return [
                {
                    "name": block.name,
                    "complexity": block.complexity,
                    "rank": block.letter,
                    "lineno": block.lineno,
                    "endline": block.endline,
                    "is_method": block.is_method
                }
                for block in results
            ]
        except Exception:
            return []
