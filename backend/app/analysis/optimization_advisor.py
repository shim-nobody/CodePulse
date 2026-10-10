"""
CodePulse Actionable Optimization Advisor
Generates concrete refactoring blueprints, trade-offs, and qualitative explanations.
"""
from typing import List, Dict, Any

class OptimizationAdvisor:
    @classmethod
    def generate_recommendations(
        cls,
        findings: List[Dict[str, Any]],
        functions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        recs = []

        for f in findings:
            if f["rule_id"] == "CP-SMELL-06":
                recs.append({
                    "id": "REC-PERF-01",
                    "title": "Replace String Concatenation Loop with str.join()",
                    "severity": "warning",
                    "problem": "Repeated '+=' string concatenation inside an iterative loop.",
                    "supporting_evidence": f"Detected at line {f.get('line_number', 1)}: accumulating string copies iteratively.",
                    "suggested_improvement": "Collect tokens into a list buffer and invoke `separator.join(buffer)` once after loop completes.",
                    "expected_benefit": "Reduces asymptotic runtime from O(n?) memory copying to optimal linear O(n) memory allocation.",
                    "tradeoffs": "Requires maintaining a small list buffer in auxiliary memory during the loop.",
                    "safe_to_apply": True,
                    "refactored_code": "# Before:\n# s = ''\n# for item in items:\n#     s += str(item)\n\n# After:\n# buffer = [str(item) for item in items]\n# s = ''.join(buffer)",
                    "line_number": f.get("line_number")
                })
            elif f["rule_id"] == "CP-SMELL-03":
                recs.append({
                    "id": "REC-SAFE-01",
                    "title": "Use None Sentinel for Default Collection Arguments",
                    "severity": "error",
                    "problem": "Mutable default argument in function signature causes shared state between invocations.",
                    "supporting_evidence": f"Signature at line {f.get('line_number', 1)}.",
                    "suggested_improvement": "Set parameter default to `None` and instantiate new collection inside the function.",
                    "expected_benefit": "Prevents subtle data corruption bugs where subsequent callers receive accumulated state.",
                    "tradeoffs": "None; strictly follows idiomatic Python practices.",
                    "safe_to_apply": True,
                    "refactored_code": "def process_data(items=None):\n    if items is None:\n        items = []\n    # continue processing...",
                    "line_number": f.get("line_number")
                })

        for fn in functions:
            cc = fn.get("cyclomatic_complexity", 1)
            if cc > 10:
                recs.append({
                    "id": f"REC-COMPLEX-{fn['name']}",
                    "title": f"Refactor High Cyclomatic Complexity in '{fn['name']}' (CC: {cc})",
                    "severity": "warning",
                    "problem": f"Function has {cc} branch decision points, making full branch test coverage difficult.",
                    "supporting_evidence": f"Lines {fn['line_start']}-{fn['line_end']} exhibit {cc} decision pathways.",
                    "suggested_improvement": "Split complex branching logic into lookup tables, strategy dictionaries, or dedicated subroutines.",
                    "expected_benefit": "Reduces cyclomatic complexity below standard warning threshold (< 10), enhancing maintainability.",
                    "tradeoffs": "Introduces minor indirection via helper functions or dispatch maps.",
                    "safe_to_apply": False,
                    "refactored_code": None,
                    "line_number": fn["line_start"]
                })

        return recs
