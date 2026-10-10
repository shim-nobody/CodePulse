"""
CodePulse Rule-Based Code Smell & Anti-Pattern Detector
Deterministic and heuristic rules with complete justifications and suggested actions.
"""
import ast
from typing import List, Dict, Any

class CodeSmellDetector:
    @classmethod
    def detect_all(cls, tree: ast.AST, source_code: str) -> List[Dict[str, Any]]:
        findings = []

        for node in ast.walk(tree):
            # Rule 1: Long Function (LOC > 40)
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                start = node.lineno
                end = getattr(node, "end_lineno", start)
                length = end - start + 1
                if length > 40:
                    findings.append({
                        "rule_id": "CP-SMELL-01",
                        "severity": "warning",
                        "category": "maintainability",
                        "title": f"Long Function '{node.name}' ({length} lines)",
                        "description": f"Function '{node.name}' spans {length} lines (threshold: 40 lines). Long functions are harder to reason about and test.",
                        "why_it_matters": "Functions exceeding 40 lines violate single-responsibility principles and exponentially increase cognitive maintenance burden.",
                        "suggested_action": "Decompose this function into smaller, single-purpose helper functions with explicit input and return contracts.",
                        "is_deterministic": True,
                        "line_number": start,
                        "end_line_number": end,
                        "function_name": node.name
                    })

                # Rule 2: High Parameter Count (> 4 params)
                param_count = len(node.args.args)
                if param_count > 4:
                    findings.append({
                        "rule_id": "CP-SMELL-02",
                        "severity": "warning",
                        "category": "design",
                        "title": f"High Parameter Count ({param_count} params)",
                        "description": f"Function '{node.name}' accepts {param_count} positional parameters.",
                        "why_it_matters": "High parameter counts make function calls brittle and signal that the function may be handling too many concerns.",
                        "suggested_action": "Group related parameters into a dataclass, dictionary, or configuration object.",
                        "is_deterministic": True,
                        "line_number": start,
                        "end_line_number": start,
                        "function_name": node.name
                    })

                # Rule 3: Mutable default argument
                for default_node in node.args.defaults:
                    if isinstance(default_node, (ast.List, ast.Dict, ast.Set)):
                        findings.append({
                            "rule_id": "CP-SMELL-03",
                            "severity": "error",
                            "category": "design",
                            "title": "Mutable Default Parameter in Function Signature",
                            "description": f"Function '{node.name}' defines a mutable default argument ({type(default_node).__name__}).",
                            "why_it_matters": "Python default argument values are evaluated once at definition time, causing state to persist across calls.",
                            "suggested_action": "Use 'None' as default value and initialize with empty collection inside function body (e.g., if arg is None: arg = []).",
                            "is_deterministic": True,
                            "line_number": start,
                            "end_line_number": start,
                            "function_name": node.name
                        })

            # Rule 4: Deeply Nested Control Flow (> 3 levels)
            if isinstance(node, (ast.If, ast.For, ast.While)):
                depth = 0
                for child in ast.walk(node):
                    if isinstance(child, (ast.If, ast.For, ast.While)) and child is not node:
                        depth += 1
                if depth >= 3:
                    findings.append({
                        "rule_id": "CP-SMELL-04",
                        "severity": "warning",
                        "category": "complexity",
                        "title": "Deeply Nested Control Flow Structure",
                        "description": f"Control structure beginning at line {node.lineno} contains {depth} nested control flow blocks.",
                        "why_it_matters": "Arrow-shaped nested code severely impedes readability and increases mental stack requirements for debugging.",
                        "suggested_action": "Use guard clauses with early returns or extract nested logic into dedicated helper subroutines.",
                        "is_deterministic": True,
                        "line_number": getattr(node, "lineno", 1),
                        "end_line_number": getattr(node, "end_lineno", node.lineno),
                        "function_name": None
                    })

            # Rule 5: Bare Except or Exception Catch-All
            if isinstance(node, ast.ExceptHandler):
                if node.type is None:
                    findings.append({
                        "rule_id": "CP-SMELL-05",
                        "severity": "error",
                        "category": "maintainability",
                        "title": "Bare 'except:' Clause Masks Unhandled Failures",
                        "description": f"Line {node.lineno} catches all exceptions indiscriminately without specifying the exception type.",
                        "why_it_matters": "Bare except catches SystemExit and KeyboardInterrupt, concealing bugs and preventing proper process termination.",
                        "suggested_action": "Specify concrete exception classes (e.g. 'except ValueError:') or at minimum 'except Exception:'.",
                        "is_deterministic": True,
                        "line_number": node.lineno,
                        "end_line_number": getattr(node, "end_lineno", node.lineno),
                        "function_name": None
                    })

            # Rule 6: Quadratic String Concatenation in Loops
            if isinstance(node, (ast.For, ast.While)):
                for child in ast.walk(node):
                    if isinstance(child, ast.AugAssign) and isinstance(child.op, ast.Add):
                        if isinstance(child.target, ast.Name):
                            findings.append({
                                "rule_id": "CP-SMELL-06",
                                "severity": "warning",
                                "category": "performance",
                                "title": "Repeated '+=' String Accumulation in Loop",
                                "description": f"Augmented addition inside loop at line {child.lineno} may result in quadratic memory reallocation.",
                                "why_it_matters": "Immutable strings require reallocating and copying the entire prefix on every loop iteration, causing O(N?) time.",
                                "suggested_action": "Append chunks to a list and join them with ''.join(chunks) once after the loop.",
                                "is_deterministic": False,
                                "line_number": child.lineno,
                                "end_line_number": child.lineno,
                                "function_name": None
                            })

        return findings
