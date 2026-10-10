"""
CodePulse Comparison Center API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.schemas import CompareRequest, CompareResponse, CompareMetricDiff
from app.analysis.engine import AnalysisEngine
from app.services.analysis_service import AnalysisService

router = APIRouter(prefix="/compare", tags=["Comparisons"])

@router.post("", response_model=CompareResponse)
def compare_code_snippets(req: CompareRequest, db: Session = Depends(get_db)):
    code_a = req.code_a
    code_b = req.code_b

    # If IDs given, look them up
    if req.analysis_id_a:
        run_a = AnalysisService.get_analysis_by_id(db, req.analysis_id_a)
        if run_a:
            code_a = run_a.source_code
    if req.analysis_id_b:
        run_b = AnalysisService.get_analysis_by_id(db, req.analysis_id_b)
        if run_b:
            code_b = run_b.source_code

    if not code_a or not code_b:
        raise HTTPException(
            status_code=400,
            detail="Must provide either code_a and code_b or analysis_id_a and analysis_id_b"
        )

    res_a = AnalysisEngine.analyze(code_a, title="Version A (Original)")
    res_b = AnalysisEngine.analyze(code_b, title="Version B (Modified)")

    # Metrics comparison
    metrics_diff = [
        CompareMetricDiff(
            metric_name="Lines of Code (LOC)",
            value_a=res_a["loc"],
            value_b=res_b["loc"],
            diff=res_b["loc"] - res_a["loc"],
            better="B" if res_b["loc"] < res_a["loc"] else ("A" if res_a["loc"] < res_b["loc"] else "EQUAL")
        ),
        CompareMetricDiff(
            metric_name="Cyclomatic Complexity (Avg)",
            value_a=res_a["avg_cyclomatic_complexity"],
            value_b=res_b["avg_cyclomatic_complexity"],
            diff=round(res_b["avg_cyclomatic_complexity"] - res_a["avg_cyclomatic_complexity"], 2),
            better="B" if res_b["avg_cyclomatic_complexity"] < res_a["avg_cyclomatic_complexity"] else ("A" if res_a["avg_cyclomatic_complexity"] < res_b["avg_cyclomatic_complexity"] else "EQUAL")
        ),
        CompareMetricDiff(
            metric_name="Maintainability Index",
            value_a=res_a["maintainability_index"],
            value_b=res_b["maintainability_index"],
            diff=round(res_b["maintainability_index"] - res_a["maintainability_index"], 1),
            better="B" if res_b["maintainability_index"] > res_a["maintainability_index"] else ("A" if res_a["maintainability_index"] > res_b["maintainability_index"] else "EQUAL")
        ),
        CompareMetricDiff(
            metric_name="Overall Time Complexity",
            value_a=res_a["overall_time_complexity"],
            value_b=res_b["overall_time_complexity"],
            diff=None,
            better="NEUTRAL"
        ),
        CompareMetricDiff(
            metric_name="Overall Space Complexity",
            value_a=res_a["overall_space_complexity"],
            value_b=res_b["overall_space_complexity"],
            diff=None,
            better="NEUTRAL"
        )
    ]

    findings_a_rules = {f["rule_id"] for f in res_a["findings"]}
    findings_b_rules = {f["rule_id"] for f in res_b["findings"]}
    resolved = list(findings_a_rules - findings_b_rules)
    new_findings = list(findings_b_rules - findings_a_rules)

    verdict = (
        "Version B demonstrates improved maintainability and lower complexity."
        if res_b["maintainability_index"] >= res_a["maintainability_index"]
        else "Version A exhibits higher maintainability index and fewer flagged patterns."
    )

    return CompareResponse(
        analysis_a=res_a,
        analysis_b=res_b,
        metrics_comparison=metrics_diff,
        findings_diff={
            "resolved_findings_count": len(resolved),
            "new_findings_count": len(new_findings),
            "resolved_rules": resolved,
            "new_rules": new_findings
        },
        summary_verdict=verdict
    )
