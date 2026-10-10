"""
CodePulse Unified Static Analysis Engine
Orchestrates parsing, cyclomatic metrics, maintainability index,
algorithmic complexity estimation, smell detection, and advisor recommendations.
"""
import time
import uuid
from datetime import datetime
from typing import Dict, Any

from app.analysis.parser import PythonSourceParser
from app.analysis.cyclomatic_metrics import CyclomaticAnalyzer
from app.analysis.maintainability_metrics import MaintainabilityAnalyzer
from app.analysis.complexity_estimator import ComplexityEstimator
from app.analysis.loop_analyzer import LoopAnalyzer
from app.analysis.call_graph import CallGraphExtractor
from app.analysis.ast_visualizer import ASTVisualizer
from app.analysis.code_smell_detector import CodeSmellDetector
from app.analysis.optimization_advisor import OptimizationAdvisor

class AnalysisEngine:
    ENGINE_VERSION = "1.0.0"

    @classmethod
    def analyze(
        cls,
        source_code: str,
        filename: str = "main.py",
        title: str = "Interactive Analysis",
        include_ast: bool = True,
        include_call_graph: bool = True
    ) -> Dict[str, Any]:
        start_time = time.time()
        started_at = datetime.utcnow()
        analysis_id = str(uuid.uuid4())

        parse_result = PythonSourceParser.parse(source_code)
        if not parse_result.success:
            elapsed_ms = (time.time() - start_time) * 1000.0
            return {
                "id": analysis_id,
                "title": title,
                "language": "python",
                "source_code": source_code,
                "status": "failed",
                "error_message": f"Syntax Error at line {parse_result.line}, col {parse_result.column}: {parse_result.error}",
                "loc": len(source_code.splitlines()),
                "lloc": 0,
                "sloc": 0,
                "comments": 0,
                "avg_cyclomatic_complexity": 0.0,
                "max_cyclomatic_complexity": 0,
                "maintainability_index": 0.0,
                "overall_time_complexity": "Unknown (Syntax Error)",
                "overall_space_complexity": "Unknown",
                "functions": [],
                "findings": [],
                "recommendations": [],
                "ast_tree": None,
                "call_graph": None,
                "started_at": started_at,
                "completed_at": datetime.utcnow(),
                "execution_time_ms": round(elapsed_ms, 2),
                "engine_version": cls.ENGINE_VERSION
            }

        tree = parse_result.tree

        raw_metrics = MaintainabilityAnalyzer.calculate_raw_metrics(source_code)
        loc = raw_metrics["loc"]
        sloc = raw_metrics["sloc"]
        comments = raw_metrics["comments"]

        func_nodes = PythonSourceParser.extract_functions(tree)
        functions_data = []
        total_cc = 0
        max_cc = 1
        dominant_time_complexity = "O(1)"
        dominant_space_complexity = "O(1)"

        complexity_precedence = {
            "O(1)": 1,
            "O(log n)": 2,
            "O(n)": 3,
            "O(n log n)": 4,
            "O(n?)": 5,
            "O(n?)": 6,
            "O(2^n)": 7,
            "O(n!)": 8
        }
        highest_prec = 1

        for func_node in func_nodes:
            cc_res = CyclomaticAnalyzer.analyze_function(func_node)
            cc_score = cc_res["score"]
            total_cc += cc_score
            max_cc = max(max_cc, cc_score)

            halstead = MaintainabilityAnalyzer.calculate_halstead(func_node)
            func_loc = (getattr(func_node, "end_lineno", func_node.lineno) - func_node.lineno + 1)
            mi_score = MaintainabilityAnalyzer.calculate_mi(halstead["volume"], cc_score, func_loc)

            comp_est = ComplexityEstimator.estimate_function(func_node)
            
            curr_prec = complexity_precedence.get(comp_est.time_complexity, 3)
            if curr_prec > highest_prec:
                highest_prec = curr_prec
                dominant_time_complexity = comp_est.time_complexity
                dominant_space_complexity = comp_est.space_complexity

            functions_data.append({
                "id": str(uuid.uuid4()),
                "name": func_node.name,
                "line_start": func_node.lineno,
                "line_end": getattr(func_node, "end_lineno", func_node.lineno),
                "cyclomatic_complexity": cc_score,
                "cyclomatic_rank": cc_res["rank"],
                "time_complexity": comp_est.time_complexity,
                "space_complexity": comp_est.space_complexity,
                "complexity_confidence": comp_est.confidence,
                "complexity_reasoning": comp_est.reasoning,
                "maintainability_index": mi_score,
                "parameters_count": len(func_node.args.args),
                "nesting_depth": LoopAnalyzer.get_max_nesting_depth(func_node),
                "is_recursive": "2^n" in comp_est.time_complexity or "recursive" in comp_est.reasoning.lower(),
                "halstead_metrics": halstead
            })

        avg_cc = (total_cc / len(func_nodes)) if func_nodes else 1.0

        file_halstead = MaintainabilityAnalyzer.calculate_halstead(tree)
        overall_mi = MaintainabilityAnalyzer.calculate_mi(
            file_halstead["volume"],
            int(avg_cc),
            loc,
            (comments / float(loc)) if loc > 0 else 0.0
        )

        findings = CodeSmellDetector.detect_all(tree, source_code)
        recommendations = OptimizationAdvisor.generate_recommendations(findings, functions_data)

        ast_tree = ASTVisualizer.to_tree(tree, max_depth=4) if include_ast else None
        call_graph = CallGraphExtractor.extract(tree) if include_call_graph else None

        elapsed_ms = (time.time() - start_time) * 1000.0

        return {
            "id": analysis_id,
            "title": title,
            "language": "python",
            "source_code": source_code,
            "status": "completed",
            "error_message": None,
            "loc": loc,
            "lloc": raw_metrics.get("lloc", sloc),
            "sloc": sloc,
            "comments": comments,
            "avg_cyclomatic_complexity": round(avg_cc, 2),
            "max_cyclomatic_complexity": max_cc,
            "maintainability_index": round(overall_mi, 1),
            "overall_time_complexity": dominant_time_complexity,
            "overall_space_complexity": dominant_space_complexity,
            "functions": functions_data,
            "findings": findings,
            "recommendations": recommendations,
            "ast_tree": ast_tree,
            "call_graph": call_graph,
            "started_at": started_at,
            "completed_at": datetime.utcnow(),
            "execution_time_ms": round(elapsed_ms, 2),
            "engine_version": cls.ENGINE_VERSION
        }
