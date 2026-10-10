"""
CodePulse Algorithmic Complexity Estimator
Recognizes structural loop, recursion, and API usage patterns.
Explicitly identifies assumptions, evidence, confidence, and limitations.
"""
import ast
from typing import Dict, Any, List, Optional
from app.analysis.loop_analyzer import LoopAnalyzer
from app.analysis.recursion_analyzer import RecursionAnalyzer

class ComplexityEstimate:
    def __init__(
        self,
        time_complexity: str,
        space_complexity: str,
        confidence: str,
        evidence: List[str],
        assumptions: List[str],
        limitations: List[str],
        reasoning: str
    ):
        self.time_complexity = time_complexity
        self.space_complexity = space_complexity
        self.confidence = confidence # high, medium, low, unknown
        self.evidence = evidence
        self.assumptions = assumptions
        self.limitations = limitations
        self.reasoning = reasoning

    def to_dict(self) -> Dict[str, Any]:
        return {
            "time_complexity": self.time_complexity,
            "space_complexity": self.space_complexity,
            "confidence": self.confidence,
            "evidence": self.evidence,
            "assumptions": self.assumptions,
            "limitations": self.limitations,
            "reasoning": self.reasoning
        }

class ComplexityEstimator:
    @classmethod
    def estimate_function(cls, func_node: ast.FunctionDef | ast.AsyncFunctionDef) -> ComplexityEstimate:
        evidence: List[str] = []
        assumptions: List[str] = [
            "Assumes primary input collection/integer scale parameter is represented by n",
            "Assumes standard library operations run within standard worst-case bounds"
        ]
        limitations: List[str] = [
            "Static heuristic estimation cannot inspect runtime branch probabilities or data-dependent halts",
            "This is an algorithmic structure estimate, not a mathematical formal proof"
        ]

        # 1. Analyze recursion
        rec_data = RecursionAnalyzer.analyze_recursion(func_node)
        if rec_data["is_recursive"]:
            branching = rec_data["branching_factor"]
            if branching >= 2:
                evidence.append(f"Detected multi-branch recursion ({branching} recursive invocations per call)")
                evidence.append(f"Recursive call lines: {rec_data['call_lines']}")
                return ComplexityEstimate(
                    time_complexity="O(2^n)",
                    space_complexity="O(n) auxiliary stack",
                    confidence="medium",
                    evidence=evidence,
                    assumptions=assumptions + ["Assumes non-memoized divide-and-conquer or tree recursion"],
                    limitations=limitations,
                    reasoning=f"Function '{func_node.name}' makes {branching} recursive calls in its body, creating an exponential call tree without explicit memoization detected."
                )
            else:
                evidence.append("Detected single-branch linear/logarithmic recursion")
                evidence.append(f"Recursive call lines: {rec_data['call_lines']}")
                return ComplexityEstimate(
                    time_complexity="O(n)",
                    space_complexity="O(n) auxiliary stack",
                    confidence="medium",
                    evidence=evidence,
                    assumptions=assumptions + ["Assumes linear decrement in recursive argument per level"],
                    limitations=limitations,
                    reasoning=f"Function '{func_node.name}' uses single-branch recursion with linear depth, yielding O(n) calls and recursion stack depth."
                )

        # 2. Analyze loops
        loops = LoopAnalyzer.analyze_loops(func_node)
        max_depth = 0
        has_log_loop = False
        has_linear_loop = False

        for loop in loops:
            nested = loop["nested_loops_count"]
            max_depth = max(max_depth, nested + 1)
            if loop["step_pattern"] == "logarithmic":
                has_log_loop = True
            else:
                has_linear_loop = True

        # Check for standard library calls: sorted, sort, binary search (bisect)
        has_sort = False
        has_bisect = False
        for node in ast.walk(func_node):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name):
                    if node.func.id in ("sorted", "sort"):
                        has_sort = True
                        evidence.append(f"Invokes built-in {node.func.id}() comparison sort")
                    elif node.func.id in ("bisect", "bisect_left", "bisect_right"):
                        has_bisect = True
                        evidence.append("Invokes binary search via bisect module")
                elif isinstance(node.func, ast.Attribute) and node.func.attr == "sort":
                    has_sort = True
                    evidence.append("Invokes in-place list.sort() (Timsort)")

        # 3. Memory / Space Complexity Heuristics
        allocates_collections = False
        for node in ast.walk(func_node):
            if isinstance(node, (ast.ListComp, ast.SetComp, ast.DictComp)):
                allocates_collections = True
                evidence.append(f"Creates new collection via {type(node).__name__}")
            elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in ("list", "dict", "set"):
                allocates_collections = True

        space_comp = "O(n)" if allocates_collections else "O(1)"

        # 4. Formulate Time Complexity verdict
        if max_depth == 0:
            if has_sort:
                time_comp = "O(n log n)"
                conf = "high"
                evidence.append("No loops found, dominated by O(n log n) comparison sort operation")
                reasoning = "Dominant operation is Timsort / sorted() which executes in O(n log n) time on input of size n."
            elif has_bisect:
                time_comp = "O(log n)"
                conf = "high"
                evidence.append("No loops found, dominated by binary search query")
                reasoning = "Operates via binary search halving intervals in O(log n) time."
            else:
                time_comp = "O(1)"
                conf = "high"
                evidence.append("No loops, recursion, or unbounded iterations detected")
                reasoning = "Contains only direct statements, arithmetic, and constant-time lookups."
        elif max_depth == 1:
            if has_log_loop:
                time_comp = "O(log n)"
                conf = "high"
                evidence.append("Single loop with multiplicative/divisive step update pattern (e.g. index //= 2)")
                reasoning = "Loop counter is halved/divided iteratively, terminating in logarithmic steps O(log n)."
            elif has_sort:
                time_comp = "O(n log n)"
                conf = "high"
                evidence.append("Single linear loop accompanied by sort operation O(n log n)")
                reasoning = "Combines a linear pass O(n) with comparison sorting O(n log n); dominated by O(n log n)."
            else:
                time_comp = "O(n)"
                conf = "high"
                evidence.append(f"Single loop over input elements at line {loops[0]['line'] if loops else 1}")
                reasoning = "Single non-nested iteration pass traversing sequence of length n."
        elif max_depth == 2:
            time_comp = "O(n?)"
            conf = "high"
            evidence.append("Nested loop structure with nesting depth 2 (outer + inner loop)")
            reasoning = "Two nested iterations over input bounds, resulting in quadratic operation count O(n?)."
        elif max_depth == 3:
            time_comp = "O(n?)"
            conf = "high"
            evidence.append("Triple-nested loop structure with nesting depth 3")
            reasoning = "Three nested loops iterating over input scale, resulting in cubic operation count O(n?)."
        else:
            time_comp = f"O(n^{max_depth})"
            conf = "medium"
            evidence.append(f"Deeply nested loop structure with nesting depth {max_depth}")
            reasoning = f"Encountered {max_depth} nested loop layers, yielding polynomial complexity."

        return ComplexityEstimate(
            time_complexity=time_comp,
            space_complexity=space_comp,
            confidence=conf,
            evidence=evidence,
            assumptions=assumptions,
            limitations=limitations,
            reasoning=reasoning
        )
