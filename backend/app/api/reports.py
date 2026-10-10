"""
CodePulse Report Export & Downloads API
"""
import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.analysis_service import AnalysisService
from app.analysis.report_generator import ReportGenerator

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/download/{analysis_id}/{format}")
def download_analysis_report(analysis_id: str, format: str, db: Session = Depends(get_db)):
    run = AnalysisService.get_analysis_by_id(db, analysis_id)
    if not run:
        raise HTTPException(status_code=404, detail="Analysis record not found")

    # Serialize run data
    funcs_data = [
        {
            "name": f.name,
            "line_start": f.line_start,
            "line_end": f.line_end,
            "cyclomatic_complexity": f.cyclomatic_complexity,
            "cyclomatic_rank": f.cyclomatic_rank,
            "time_complexity": f.time_complexity,
            "space_complexity": f.space_complexity,
            "maintainability_index": f.maintainability_index,
            "parameters_count": f.parameters_count
        }
        for f in run.functions
    ]

    findings_data = [
        {
            "rule_id": f.rule_id,
            "severity": f.severity,
            "title": f.title,
            "line_number": f.line_number,
            "description": f.description,
            "why_it_matters": f.why_it_matters,
            "suggested_action": f.suggested_action
        }
        for f in run.findings
    ]

    run_dict = {
        "id": run.id,
        "title": run.title,
        "language": run.language,
        "loc": run.loc,
        "lloc": run.lloc,
        "sloc": run.sloc,
        "comments": run.comments,
        "avg_cyclomatic_complexity": run.avg_cyclomatic_complexity,
        "max_cyclomatic_complexity": run.max_cyclomatic_complexity,
        "maintainability_index": run.maintainability_index,
        "overall_time_complexity": run.overall_time_complexity,
        "overall_space_complexity": run.overall_space_complexity,
        "functions": funcs_data,
        "findings": findings_data,
        "started_at": run.started_at.isoformat()
    }

    if format.lower() == "json":
        json_content = ReportGenerator.generate_json(run_dict)
        return Response(
            content=json_content,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=codepulse_report_{analysis_id[:8]}.json"}
        )
    elif format.lower() == "csv":
        csv_content = ReportGenerator.generate_csv(funcs_data, findings_data)
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=codepulse_metrics_{analysis_id[:8]}.csv"}
        )
    elif format.lower() == "pdf":
        temp_dir = tempfile.gettempdir()
        pdf_path = os.path.join(temp_dir, f"codepulse_report_{analysis_id[:8]}.pdf")
        ReportGenerator.generate_pdf(run_dict, pdf_path)
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=f"codepulse_report_{analysis_id[:8]}.pdf"
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format '{format}'. Use 'pdf', 'json', or 'csv'.")
