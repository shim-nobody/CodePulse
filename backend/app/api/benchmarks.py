"""
CodePulse Benchmarks & Complexity Lab Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import BenchmarkExperiment, BenchmarkResult
from app.schemas.schemas import BenchmarkRunRequest, BenchmarkResultResponse
from app.services.benchmark_service import BenchmarkService, BenchmarkSecurityError

router = APIRouter(prefix="/benchmarks", tags=["Benchmarks"])

BUILTIN_SAMPLES = [
    {
        "id": "linear_search",
        "name": "Linear Search Scan",
        "expected_complexity": "O(n)",
        "code": "def solution(arr):\n    target = -999\n    for x in arr:\n        if x == target:\n            return True\n    return False",
        "input_type": "array_int",
        "input_sizes": [1000, 5000, 10000, 25000, 50000]
    },
    {
        "id": "bubble_sort",
        "name": "Bubble Sort (Quadratic)",
        "expected_complexity": "O(n?)",
        "code": "def solution(arr):\n    a = list(arr)\n    n = len(a)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if a[j] > a[j+1]:\n                a[j], a[j+1] = a[j+1], a[j]\n    return a",
        "input_type": "array_int",
        "input_sizes": [100, 250, 500, 1000, 1500]
    },
    {
        "id": "merge_sort",
        "name": "Merge Sort (Log-linear)",
        "expected_complexity": "O(n log n)",
        "code": "def solution(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left = solution(arr[:mid])\n    right = solution(arr[mid:])\n    res, i, j = [], 0, 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            res.append(left[i])\n            i += 1\n        else:\n            res.append(right[j])\n            j += 1\n    res.extend(left[i:])\n    res.extend(right[j:])\n    return res",
        "input_type": "array_int",
        "input_sizes": [500, 1000, 5000, 10000, 25000]
    },
    {
        "id": "fibonacci_iterative",
        "name": "Fibonacci (Iterative Constant Auxiliary)",
        "expected_complexity": "O(n)",
        "code": "def solution(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b",
        "input_type": "integer",
        "input_sizes": [1000, 5000, 10000, 25000, 50000]
    }
]

@router.get("/samples")
def get_benchmark_samples():
    return BUILTIN_SAMPLES

@router.post("/run", response_model=List[BenchmarkResultResponse])
def run_benchmark_test(req: BenchmarkRunRequest):
    code = req.code_snippet
    if not code:
        # Fallback to sample
        sample = next((s for s in BUILTIN_SAMPLES if s["id"] == req.experiment_id), BUILTIN_SAMPLES[0])
        code = sample["code"]

    try:
        results = BenchmarkService.run_benchmark(
            code_snippet=code,
            function_name=req.function_name or "solution",
            input_sizes=req.input_sizes,
            input_type=req.input_type or "array_int",
            iterations=req.iterations or 3
        )
        return results
    except BenchmarkSecurityError as sec_err:
        raise HTTPException(status_code=400, detail=str(sec_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark execution error: {str(e)}")
