"""
CodePulse API Integration Tests
Tests /api/health, /api/analysis/analyze, /api/projects, /api/benchmarks/samples, /api/compare, /api/reports
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_analyze_endpoint(client):
    code = """
def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total += num
    return total
"""
    res = client.post("/api/analysis/analyze", json={
        "source_code": code,
        "title": "Sum Function Test",
        "filename": "sum.py"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "completed"
    assert len(data["functions"]) == 1
    assert data["functions"][0]["name"] == "calculate_sum"
    assert data["functions"][0]["time_complexity"] == "O(n)"

def test_projects_crud(client):
    # 1. Create project
    create_res = client.post("/api/projects", json={
        "name": "Integration Test Project",
        "description": "Testing project management lifecycle",
        "language": "python"
    })
    assert create_res.status_code == 200
    proj = create_res.json()
    proj_id = proj["id"]

    # 2. Get project
    get_res = client.get(f"/api/projects/{proj_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Integration Test Project"

    # 3. Update project
    up_res = client.put(f"/api/projects/{proj_id}", json={
        "name": "Updated Project Name"
    })
    assert up_res.status_code == 200
    assert up_res.json()["name"] == "Updated Project Name"

    # 4. Delete project
    del_res = client.delete(f"/api/projects/{proj_id}")
    assert del_res.status_code == 200

def test_benchmarks_samples_and_run(client):
    samples_res = client.get("/api/benchmarks/samples")
    assert samples_res.status_code == 200
    samples = samples_res.json()
    assert len(samples) >= 4

    # Run quick benchmark
    run_res = client.post("/api/benchmarks/run", json={
        "code_snippet": "def solution(n):\n    return n * 2",
        "function_name": "solution",
        "input_sizes": [10, 50, 100],
        "input_type": "integer",
        "iterations": 2
    })
    assert run_res.status_code == 200
    assert len(run_res.json()) == 3

def test_compare_endpoint(client):
    code_a = "def test(a):\n    return a"
    code_b = "def test(a):\n    res = []\n    for x in a:\n        res.append(x)\n    return res"
    res = client.post("/api/compare", json={
        "code_a": code_a,
        "code_b": code_b
    })
    assert res.status_code == 200
    data = res.json()
    assert "metrics_comparison" in data
    assert "summary_verdict" in data

def test_reports_export(client):
    # First analyze
    code = "def f(x):\n    return x + 1"
    a_res = client.post("/api/analysis/analyze", json={"source_code": code, "title": "Report Test"})
    analysis_id = a_res.json()["id"]

    # Download JSON
    j_res = client.get(f"/api/reports/download/{analysis_id}/json")
    assert j_res.status_code == 200
    assert j_res.headers["content-type"].startswith("application/json")

    # Download CSV
    c_res = client.get(f"/api/reports/download/{analysis_id}/csv")
    assert c_res.status_code == 200
    assert "text/csv" in c_res.headers["content-type"]

    # Download PDF
    p_res = client.get(f"/api/reports/download/{analysis_id}/pdf")
    assert p_res.status_code == 200
    assert "application/pdf" in p_res.headers["content-type"]
