"""
CodePulse Repository Multi-File & Archive Analysis API
"""
import zipfile
import io
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Dict, Any

from app.analysis.engine import AnalysisEngine

router = APIRouter(prefix="/repositories", tags=["Repositories"])

EXCLUDE_DIRS = {
    "__pycache__", ".git", ".venv", "venv", "node_modules", "dist", "build", ".idea", ".vscode"
}

@router.post("/upload")
async def analyze_repository_zip(
    file: UploadFile = File(...),
    project_name: str = Form("Uploaded Repository")
):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip repository archives are supported in this release.")

    content = await file.read()
    if len(content) > 10_000_000: # 10MB limit
        raise HTTPException(status_code=400, detail="Repository archive exceeds maximum 10MB size limit.")

    try:
        z = zipfile.ZipFile(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Corrupt or unreadable zip archive: {str(e)}")

    file_analyses = []
    total_loc = 0
    all_functions = []
    total_cc = 0.0

    for name in z.namelist():
        # Skip directories and non-python files
        if name.endswith("/") or not name.endswith(".py"):
            continue
        # Check exclusion directories
        parts = name.split("/")
        if any(part in EXCLUDE_DIRS for part in parts):
            continue

        try:
            code_bytes = z.read(name)
            code_str = code_bytes.decode("utf-8", errors="replace")
            res = AnalysisEngine.analyze(code_str, filename=name, title=name, include_ast=False, include_call_graph=False)
            
            file_analyses.append({
                "filename": name,
                "loc": res["loc"],
                "avg_cc": res["avg_cyclomatic_complexity"],
                "mi": res["maintainability_index"],
                "time_complexity": res["overall_time_complexity"],
                "functions_count": len(res["functions"]),
                "findings_count": len(res["findings"])
            })

            total_loc += res["loc"]
            total_cc += res["avg_cyclomatic_complexity"]
            for fn in res["functions"]:
                fn_copy = dict(fn)
                fn_copy["file"] = name
                all_functions.append(fn_copy)
        except Exception:
            continue

    if not file_analyses:
        raise HTTPException(status_code=400, detail="No readable Python (.py) source files found in zip archive.")

    # Rank top 5 most complex functions across the repository
    all_functions.sort(key=lambda x: x.get("cyclomatic_complexity", 1), reverse=True)
    top_complex_functions = all_functions[:6]

    avg_repo_cc = round(total_cc / len(file_analyses), 2)

    return {
        "project_name": project_name,
        "files_analyzed_count": len(file_analyses),
        "total_loc": total_loc,
        "avg_cyclomatic_complexity": avg_repo_cc,
        "top_complex_functions": top_complex_functions,
        "files": file_analyses
    }
