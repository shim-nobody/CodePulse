"""
CodePulse Analysis Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.db.database import get_db
from app.schemas.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.analysis_service import AnalysisService
from app.models.models import AnalysisRun, FunctionMetric, AnalysisFinding

router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_code(req: AnalyzeRequest, db: Session = Depends(get_db)):
    try:
        return AnalysisService.run_and_persist(db=db, req=req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/dashboard")
def get_dashboard_summary(db: Session = Depends(get_db)):
    return AnalysisService.get_dashboard_metrics(db)

@router.get("/recent")
def list_recent(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    runs = AnalysisService.list_recent_analyses(db, limit=limit)
    return [
        {
            "id": r.id,
            "title": r.title,
            "language": r.language,
            "loc": r.loc,
            "avg_cyclomatic_complexity": r.avg_cyclomatic_complexity,
            "maintainability_index": r.maintainability_index,
            "overall_time_complexity": r.overall_time_complexity,
            "status": r.status,
            "started_at": r.started_at,
            "functions_count": r.functions_count
        }
        for r in runs
    ]

@router.get("/{analysis_id}")
def get_analysis_details(analysis_id: str, db: Session = Depends(get_db)):
    run = AnalysisService.get_analysis_by_id(db, analysis_id)
    if not run:
        raise HTTPException(status_code=404, detail="Analysis record not found")
    
    # Format functions
    funcs = []
    for fm in run.functions:
        funcs.append({
            "id": fm.id,
            "name": fm.name,
            "line_start": fm.line_start,
            "line_end": fm.line_end,
            "cyclomatic_complexity": fm.cyclomatic_complexity,
            "cyclomatic_rank": fm.cyclomatic_rank,
            "time_complexity": fm.time_complexity,
            "space_complexity": fm.space_complexity,
            "complexity_confidence": fm.complexity_confidence,
            "complexity_reasoning": fm.complexity_reasoning,
            "maintainability_index": fm.maintainability_index,
            "parameters_count": fm.parameters_count,
            "nesting_depth": fm.nesting_depth,
            "is_recursive": fm.is_recursive,
            "halstead_metrics": fm.halstead_metrics or {}
        })

    findings = []
    for f in run.findings:
        findings.append({
            "id": f.id,
            "rule_id": f.rule_id,
            "severity": f.severity,
            "category": f.category,
            "title": f.title,
            "description": f.description,
            "why_it_matters": f.why_it_matters,
            "suggested_action": f.suggested_action,
            "is_deterministic": f.is_deterministic,
            "line_number": f.line_number,
            "end_line_number": f.end_line_number,
            "function_name": f.function_name
        })

    return {
        "id": run.id,
        "title": run.title,
        "language": run.language,
        "source_code": run.source_code,
        "status": run.status,
        "error_message": run.error_message,
        "loc": run.loc,
        "lloc": run.lloc,
        "sloc": run.sloc,
        "comments": run.comments,
        "avg_cyclomatic_complexity": run.avg_cyclomatic_complexity,
        "max_cyclomatic_complexity": run.max_cyclomatic_complexity,
        "maintainability_index": run.maintainability_index,
        "overall_time_complexity": run.overall_time_complexity,
        "overall_space_complexity": run.overall_space_complexity,
        "functions": funcs,
        "findings": findings,
        "recommendations": [],
        "started_at": run.started_at,
        "completed_at": run.completed_at,
        "execution_time_ms": run.execution_time_ms,
        "engine_version": run.engine_version
    }

@router.delete("/{analysis_id}")
def delete_analysis_record(analysis_id: str, db: Session = Depends(get_db)):
    success = AnalysisService.delete_analysis(db, analysis_id)
    if not success:
        raise HTTPException(status_code=404, detail="Analysis record not found")
    return {"message": "Analysis deleted successfully", "id": analysis_id}
