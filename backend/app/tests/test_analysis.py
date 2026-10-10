"""
CodePulse Unit Tests for Static Analysis Engine
Tests complexity patterns: O(1), O(log n), O(n), O(n log n), O(n?), O(2^n), syntax errors
"""
import pytest
from app.analysis.engine import AnalysisEngine

def test_constant_time_analysis():
    code = """
def add(a, b):
    return a + b
"""
    res = AnalysisEngine.analyze(code)
    assert res["status"] == "completed"
    assert len(res["functions"]) == 1
    fn = res["functions"][0]
    assert fn["time_complexity"] == "O(1)"
    assert fn["cyclomatic_complexity"] == 1

def test_linear_loop_analysis():
    code = """
def find_max(arr):
    max_val = arr[0]
    for item in arr:
        if item > max_val:
            max_val = item
    return max_val
"""
    res = AnalysisEngine.analyze(code)
    assert res["status"] == "completed"
    fn = res["functions"][0]
    assert fn["time_complexity"] == "O(n)"
    assert fn["cyclomatic_complexity"] == 3 # 1 base + 1 for + 1 if

def test_nested_loops_quadratic():
    code = """
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
"""
    res = AnalysisEngine.analyze(code)
    assert res["status"] == "completed"
    fn = res["functions"][0]
    assert fn["time_complexity"] == "O(n?)"

def test_logarithmic_step_loop():
    code = """
def binary_reduction(n):
    count = 0
    while n > 1:
        n //= 2
        count += 1
    return count
"""
    res = AnalysisEngine.analyze(code)
    assert res["status"] == "completed"
    fn = res["functions"][0]
    assert fn["time_complexity"] == "O(log n)"

def test_exponential_recursion():
    code = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
"""
    res = AnalysisEngine.analyze(code)
    assert res["status"] == "completed"
    fn = res["functions"][0]
    assert fn["time_complexity"] == "O(2^n)"

def test_sorting_operation():
    code = """
def sort_and_filter(arr):
    ordered = sorted(arr)
    return [x for x in ordered if x > 0]
"""
    res = AnalysisEngine.analyze(code)
    assert res["status"] == "completed"
    fn = res["functions"][0]
    assert fn["time_complexity"] == "O(n log n)"

def test_syntax_error_graceful_handling():
    invalid_code = "def broken(:"
    res = AnalysisEngine.analyze(invalid_code)
    assert res["status"] == "failed"
    assert "Syntax Error" in res["error_message"]
