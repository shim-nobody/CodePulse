"""
CodePulse Recursion & Call Pattern Analyzer
"""
import ast
from typing import Dict, Any

class RecursionAnalyzer:
    @staticmethod
    def analyze_recursion(func_node: ast.FunctionDef | ast.AsyncFunctionDef) -> Dict[str, Any]:
        func_name = func_node.name
        recursive_calls = []
        has_base_case = False

        # Look for return statements that don't call the function
        for subnode in ast.walk(func_node):
            if isinstance(subnode, ast.Return):
                # Check if this return statement contains a call to func_name
                contains_call = any(
                    isinstance(call_node, ast.Call) and isinstance(call_node.func, ast.Name) and call_node.func.id == func_name
                    for call_node in ast.walk(subnode)
                )
                if not contains_call:
                    has_base_case = True

            elif isinstance(subnode, ast.Call):
                if isinstance(subnode.func, ast.Name) and subnode.func.id == func_name:
                    recursive_calls.append(getattr(subnode, "lineno", func_node.lineno))

        is_recursive = len(recursive_calls) > 0
        branching_factor = len(recursive_calls)

        return {
            "is_recursive": is_recursive,
            "recursive_calls_count": branching_factor,
            "has_apparent_base_case": has_base_case if is_recursive else True,
            "branching_factor": branching_factor,
            "call_lines": recursive_calls
        }
