"""
CodePulse ? Intelligent Code Complexity Analyzer & Performance Intelligence Platform
FastAPI Application Entrypoint
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.db.database import Base, engine, SessionLocal
from app.api import health, auth, analysis, projects, benchmarks, comparisons, reports, repositories, settings as settings_api
from app.models.models import User, Project, AnalysisRun
from app.analysis.engine import AnalysisEngine
from app.services.analysis_service import AnalysisService
from app.schemas.schemas import AnalyzeRequest

app_settings = get_settings()

def seed_initial_data():
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_runs = db.query(AnalysisRun).count()
        if existing_runs == 0:
            sample_code_1 = """def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
"""
            sample_code_2 = """def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
"""
            sample_code_3 = """def fibonacci_recursive(n):
    if n <= 1:
        return n
    return fibonacci_recursive(n - 1) + fibonacci_recursive(n - 2)

def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
"""
            AnalysisService.run_and_persist(db, AnalyzeRequest(source_code=sample_code_1, title="Merge Sort Implementation", filename="merge_sort.py"))
            AnalysisService.run_and_persist(db, AnalyzeRequest(source_code=sample_code_2, title="Bubble Sort Quadratic", filename="bubble_sort.py"))
            AnalysisService.run_and_persist(db, AnalyzeRequest(source_code=sample_code_3, title="Algorithms Suite (Fibonacci & Binary Search)", filename="algos.py"))
            
            # Seed demo project
            proj = Project(
                name="Core Algorithms Library",
                description="Standard sorting and search routines analyzed for computational efficiency.",
                language="python"
            )
            db.add(proj)
            db.commit()
    except Exception as e:
        print(f"Seed error: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed
    Base.metadata.create_all(bind=engine)
    seed_initial_data()
    yield

app = FastAPI(
    title=app_settings.app_name,
    version=app_settings.app_version,
    description="Intelligent Code Complexity Analyzer & Performance Intelligence Platform",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(benchmarks.router, prefix="/api")
app.include_router(comparisons.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(repositories.router, prefix="/api")
app.include_router(settings_api.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
