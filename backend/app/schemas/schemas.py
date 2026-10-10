"""
CodePulse Pydantic Schemas
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Project Schemas ---
class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = ""
    language: Optional[str] = "python"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: str
    description: str
    language: str
    created_at: datetime
    updated_at: datetime
    files_count: Optional[int] = 0
    analyses_count: Optional[int] = 0
    avg_complexity: Optional[float] = 1.0
    class Config:
        from_attributes = True

# --- Source File Schemas ---
class SourceFileCreate(BaseModel):
    filename: str
    content: str
    language: Optional[str] = "python"

class SourceFileResponse(BaseModel):
    id: str
    project_id: Optional[str] = None
    filename: str
    language: str
    size_bytes: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Analysis Models ---
class FunctionMetricSchema(BaseModel):
    id: Optional[str] = None
    name: str
    line_start: int
    line_end: int
    cyclomatic_complexity: int
    cyclomatic_rank: str
    time_complexity: str
    space_complexity: str
    complexity_confidence: str
    complexity_reasoning: str
    maintainability_index: float
    parameters_count: int
    nesting_depth: int
    is_recursive: bool
    halstead_metrics: Optional[Dict[str, Any]] = Field(default_factory=dict)
    class Config:
        from_attributes = True

class FindingSchema(BaseModel):
    id: Optional[str] = None
    rule_id: str
    severity: str # error, warning, info
    category: str # complexity, performance, maintainability, design
    title: str
    description: str
    why_it_matters: str
    suggested_action: str
    is_deterministic: bool = True
    line_number: Optional[int] = None
    end_line_number: Optional[int] = None
    function_name: Optional[str] = None
    class Config:
        from_attributes = True

class RecommendationSchema(BaseModel):
    id: str
    title: str
    severity: str
    problem: str
    supporting_evidence: str
    suggested_improvement: str
    expected_benefit: str
    tradeoffs: str
    safe_to_apply: bool
    refactored_code: Optional[str] = None
    line_number: Optional[int] = None

class ASTNodeSchema(BaseModel):
    id: str
    label: str
    type: str
    line: Optional[int] = None
    details: Optional[Dict[str, Any]] = None
    children: List["ASTNodeSchema"] = Field(default_factory=list)

class GraphEdgeSchema(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: Optional[bool] = False

class GraphNodeSchema(BaseModel):
    id: str
    data: Dict[str, Any]
    position: Dict[str, float]
    type: Optional[str] = "customNode"

class CallGraphSchema(BaseModel):
    nodes: List[GraphNodeSchema]
    edges: List[GraphEdgeSchema]

class AnalyzeRequest(BaseModel):
    source_code: str = Field(min_length=1, max_length=1_000_000)
    language: Optional[str] = "python"
    project_id: Optional[str] = None
    filename: Optional[str] = "main.py"
    title: Optional[str] = "Interactive Analysis"
    include_ast: Optional[bool] = True
    include_call_graph: Optional[bool] = True

class AnalyzeResponse(BaseModel):
    id: str
    title: str
    language: str
    source_code: str
    status: str
    error_message: Optional[str] = None
    
    # High level metrics
    loc: int
    lloc: int
    sloc: int
    comments: int
    avg_cyclomatic_complexity: float
    max_cyclomatic_complexity: int
    maintainability_index: float
    overall_time_complexity: str
    overall_space_complexity: str
    
    # Detailed collections
    functions: List[FunctionMetricSchema]
    findings: List[FindingSchema]
    recommendations: List[RecommendationSchema]
    
    # Visual representations
    ast_tree: Optional[ASTNodeSchema] = None
    call_graph: Optional[CallGraphSchema] = None
    
    started_at: datetime
    completed_at: datetime
    execution_time_ms: float
    engine_version: str

# --- Benchmark Schemas ---
class BenchmarkCreateRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    code_snippet: str
    function_name: Optional[str] = "solution"
    input_type: Optional[str] = "integer" # integer, array_int, string
    project_id: Optional[str] = None

class BenchmarkRunRequest(BaseModel):
    experiment_id: Optional[str] = None
    code_snippet: Optional[str] = None
    function_name: Optional[str] = "solution"
    input_sizes: List[int] = [100, 500, 1000, 2000, 5000]
    input_type: Optional[str] = "integer"
    iterations: Optional[int] = 3

class BenchmarkResultResponse(BaseModel):
    input_size: int
    elapsed_time_ms: float
    memory_peak_kb: float
    iterations: int
    variance: float

class BenchmarkExperimentResponse(BaseModel):
    id: str
    name: str
    description: str
    function_name: str
    code_snippet: str
    input_type: str
    created_at: datetime
    results: List[BenchmarkResultResponse] = Field(default_factory=list)
    complexity_fit: Optional[str] = None # Empirical curve fit estimate
    class Config:
        from_attributes = True

# --- Comparison Schemas ---
class CompareRequest(BaseModel):
    code_a: Optional[str] = None
    code_b: Optional[str] = None
    analysis_id_a: Optional[str] = None
    analysis_id_b: Optional[str] = None

class CompareMetricDiff(BaseModel):
    metric_name: str
    value_a: Any
    value_b: Any
    diff: Optional[float] = None
    better: Optional[str] = None # "A", "B", "EQUAL", "NEUTRAL"

class CompareResponse(BaseModel):
    analysis_a: AnalyzeResponse
    analysis_b: AnalyzeResponse
    metrics_comparison: List[CompareMetricDiff]
    findings_diff: Dict[str, Any]
    summary_verdict: str

# --- Reports & Settings ---
class ReportGenerateRequest(BaseModel):
    analysis_id: str
    format: str = "pdf" # pdf, json, csv

class ReportResponse(BaseModel):
    id: str
    analysis_id: str
    format: str
    filename: str
    created_at: datetime
    class Config:
        from_attributes = True

class UserPreferenceUpdate(BaseModel):
    theme: Optional[str] = None
    editor_font_size: Optional[int] = None
    editor_tab_size: Optional[int] = None
    default_language: Optional[str] = None
    cc_warning_threshold: Optional[int] = None
    cc_critical_threshold: Optional[int] = None
    ai_explanations_enabled: Optional[bool] = None

class UserPreferenceResponse(BaseModel):
    theme: str = "light"
    editor_font_size: int = 14
    editor_tab_size: int = 4
    default_language: str = "python"
    cc_warning_threshold: int = 10
    cc_critical_threshold: int = 20
    ai_explanations_enabled: bool = False
    class Config:
        from_attributes = True
