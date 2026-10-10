"""
CodePulse Maintainability Index & Halstead Metrics Calculator
"""
import ast
import math
from typing import Dict, Any, Set
from radon.raw import analyze as raw_analyze
from radon.metrics import h_visit

class MaintainabilityAnalyzer:
    @staticmethod
    def calculate_raw_metrics(source_code: str) -> Dict[str, int]:
        try:
            raw = raw_analyze(source_code)
            return {
                "loc": raw.loc,
                "lloc": raw.lloc,
                "sloc": raw.sloc,
                "comments": raw.comments,
                "multi": raw.multi,
                "blank": raw.blank
            }
        except Exception:
            lines = source_code.splitlines()
            total_loc = len(lines)
            blank = sum(1 for line in lines if not line.strip())
            comments = sum(1 for line in lines if line.strip().startswith("#"))
            sloc = total_loc - blank - comments
            return {
                "loc": total_loc,
                "lloc": sloc,
                "sloc": sloc,
                "comments": comments,
                "multi": 0,
                "blank": blank
            }

    @staticmethod
    def calculate_halstead(node: ast.AST) -> Dict[str, Any]:
        operators: Set[str] = set()
        operands: Set[str] = set()
        total_operators = 0
        total_operands = 0

        for subnode in ast.walk(node):
            if isinstance(subnode, (ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow)):
                operators.add(type(subnode).__name__)
                total_operators += 1
            elif isinstance(subnode, (ast.Eq, ast.NotEq, ast.Lt, ast.LtE, ast.Gt, ast.GtE, ast.Is, ast.IsNot, ast.In, ast.NotIn)):
                operators.add(type(subnode).__name__)
                total_operators += 1
            elif isinstance(subnode, (ast.And, ast.Or, ast.Not)):
                operators.add(type(subnode).__name__)
                total_operators += 1
            elif isinstance(subnode, (ast.Assign, ast.AugAssign, ast.Return, ast.If, ast.For, ast.While, ast.Call)):
                operators.add(type(subnode).__name__)
                total_operators += 1
            elif isinstance(subnode, ast.Name):
                operands.add(subnode.id)
                total_operands += 1
            elif isinstance(subnode, ast.Constant):
                operands.add(str(subnode.value))
                total_operands += 1

        n1 = len(operators) # distinct operators
        n2 = len(operands)  # distinct operands
        N1 = total_operators
        N2 = total_operands

        vocabulary = n1 + n2
        length = N1 + N2
        
        # Calculate Volume V = N * log2(n)
        volume = length * math.log2(vocabulary) if vocabulary > 0 else 0.0
        
        # Difficulty D = (n1 / 2) * (N2 / n2)
        difficulty = ((n1 / 2.0) * (N2 / float(n2))) if n2 > 0 else 1.0
        
        # Effort E = D * V
        effort = difficulty * volume
        
        # Estimated time to program T = E / 18 seconds
        time_to_program = effort / 18.0
        
        # Delivered bugs B = V / 3000
        delivered_bugs = volume / 3000.0

        return {
            "distinct_operators": n1,
            "distinct_operands": n2,
            "total_operators": N1,
            "total_operands": N2,
            "vocabulary": vocabulary,
            "length": length,
            "volume": round(volume, 2),
            "difficulty": round(difficulty, 2),
            "effort": round(effort, 2),
            "time_seconds": round(time_to_program, 2),
            "estimated_bugs": round(delivered_bugs, 4)
        }

    @classmethod
    def calculate_mi(cls, volume: float, cc: int, loc: int, comment_ratio: float = 0.0) -> float:
        """
        Calculates normalized Maintainability Index (0 to 100)
        Standard SEI formula:
        MI = 171 - 5.2 * ln(V) - 0.23 * CC - 16.2 * ln(LOC) + 50 * sin(sqrt(2.4 * perCM))
        """
        try:
            if volume <= 0:
                volume = 1.0
            if loc <= 0:
                loc = 1

            orig_mi = 171.0 - (5.2 * math.log(volume)) - (0.23 * cc) - (16.2 * math.log(loc))
            if comment_ratio > 0:
                orig_mi += 50.0 * math.sin(math.sqrt(2.4 * comment_ratio))

            # Normalize to 0 - 100 scale
            normalized = max(0.0, min(100.0, (orig_mi * 100.0) / 171.0))
            return round(normalized, 1)
        except Exception:
            return 85.0
