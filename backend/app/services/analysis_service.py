"""
CodePulse Analysis Persistence & Analytics Service
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.models import AnalysisRun, FunctionMetric, AnalysisFinding, Project
from app.analysis.engine import AnalysisEngine
from app.schemas.schemas import AnalyzeRequest, CompareRequest

class AnalysisService:
    @staticmethod
    def run_and_persist(db: Session, req: AnalyzeRequest, user_id: Optional[str] = None) -> Dict[str, Any]:
        result = AnalysisEngine.analyze(
            source_code=req.source_code,
            filename=req.filename or "main.py",
            title=req.title or "Interactive Analysis",
            include_ast=req.include_ast,
            include_call_graph=req.include_call_graph
        )

        run = AnalysisRun(
            id=result["id"],
            title=result["title"],
            language=result["language"],
            source_code=result["source_code"],
            status=result["status"],
            error_message=result.get("error_message"),
            loc=result.get("loc", 0),
            lloc=result.get("lloc", 0),
            sloc=result.get("sloc", 0),
            comments=result.get("comments", 0),
            avg_cyclomatic_complexity=result.get("avg_cyclomatic_complexity", 1.0),
            max_cyclomatic_complexity=result.get("max_cyclomatic_complexity", 1),
            maintainability_index=result.get("maintainability_index", 100.0),
            overall_time_complexity=result.get("overall_time_complexity", "O(1)"),
            overall_space_complexity=result.get("overall_space_complexity", "O(1)"),
            functions_count=len(result.get("functions", [])),
            execution_time_ms=result.get("execution_time_ms", 0.0),
            engine_version=result.get("engine_version", "1.0.0")
        )
        db.add(run)

        # Persist functions
        for fn in result.get("functions", []):
            fm = FunctionMetric(
                id=fn["id"],
                analysis_id=run.id,
                name=fn["name"],
                line_start=fn["line_start"],
                line_end=fn["line_end"],
                cyclomatic_complexity=fn["cyclomatic_complexity"],
                cyclomatic_rank=fn["cyclomatic_rank"],
                time_complexity=fn["time_complexity"],
                space_complexity=fn["space_complexity"],
                complexity_confidence=fn["complexity_confidence"],
                complexity_reasoning=fn["complexity_reasoning"],
                maintainability_index=fn["maintainability_index"],
                parameters_count=fn["parameters_count"],
                nesting_depth=fn["nesting_depth"],
                is_recursive=fn["is_recursive"],
                halstead_metrics=fn.get("halstead_metrics", {})
            )
            db.add(fm)

        # Persist findings
        for f in result.get("findings", []):
            af = AnalysisFinding(
                analysis_id=run.id,
                rule_id=f["rule_id"],
                severity=f["severity"],
                category=f["category"],
                title=f["title"],
                description=f["description"],
                why_it_matters=f["why_it_matters"],
                suggested_action=f["suggested_action"],
                is_deterministic=f["is_deterministic"],
                line_number=f.get("line_number"),
                end_line_number=f.get("end_line_number"),
                function_name=f.get("function_name")
            )
            db.add(af)

        db.commit()
        return result

    @staticmethod
    def get_analysis_by_id(db: Session, analysis_id: str) -> Optional[AnalysisRun]:
        return db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()

    @staticmethod
    def list_recent_analyses(db: Session, limit: int = 15) -> List[AnalysisRun]:
        return db.query(AnalysisRun).order_by(desc(AnalysisRun.started_at)).limit(limit).all()

    @staticmethod
    def delete_analysis(db: Session, analysis_id: str) -> bool:
        run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
        if run:
            db.delete(run)
            db.commit()
            return True
        return False

    @staticmethod
    def get_dashboard_metrics(db: Session) -> Dict[str, Any]:
        total_runs = db.query(func.count(AnalysisRun.id)).scalar() or 0
        avg_cc = db.query(func.avg(AnalysisRun.avg_cyclomatic_complexity)).scalar() or 1.0
        avg_mi = db.query(func.avg(AnalysisRun.maintainability_index)).scalar() or 85.0
        flagged_functions = db.query(func.count(FunctionMetric.id)).filter(FunctionMetric.cyclomatic_complexity > 10).scalar() or 0

        recent_runs = db.query(AnalysisRun).order_by(desc(AnalysisRun.started_at)).limit(6).all()
        recent_data = [
            {
                "id": r.id,
                "title": r.title,
                "language": r.language,
                "loc": r.loc,
                "avg_cc": round(r.avg_cyclomatic_complexity, 1),
                "mi": round(r.maintainability_index, 1),
                "overall_time": r.overall_time_complexity,
                "status": r.status,
                "date": r.started_at.strftime("%Y-%m-%d %H:%M")
            }
            for r in recent_runs
        ]

        # Complexity distribution
        all_funcs = db.query(FunctionMetric).all()
        rank_counts = {"A": 0, "B": 0, "C": 0, "D": 0, "E": 0, "F": 0}
        for fn in all_funcs:
            rank = fn.cyclomatic_rank or "A"
            rank_counts[rank] = rank_counts.get(rank, 0) + 1

        complexity_dist = [
            {"rank": k, "count": v, "range": "1-5" if k == "A" else "6-10" if k == "B" else "11-20" if k == "C" else "21-30" if k == "D" else "31-40" if k == "E" else "41+"}
            for k, v in rank_counts.items()
        ]

        return {
            "total_analyses": total_runs,
            "avg_cyclomatic_complexity": round(float(avg_cc), 1),
            "avg_maintainability_index": round(float(avg_mi), 1),
            "flagged_functions_count": flagged_functions,
            "recent_activity": recent_data,
            "complexity_distribution": complexity_dist
        }
