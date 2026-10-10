"""
CodePulse Database Models
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.db.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, default="")
    language = Column(String(50), default="python")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="projects")
    source_files = relationship("SourceFile", back_populates="project", cascade="all, delete-orphan")
    benchmarks = relationship("BenchmarkExperiment", back_populates="project", cascade="all, delete-orphan")

class SourceFile(Base):
    __tablename__ = "source_files"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    language = Column(String(50), default="python")
    size_bytes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="source_files")
    analyses = relationship("AnalysisRun", back_populates="source_file", cascade="all, delete-orphan")

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    source_file_id = Column(String(36), ForeignKey("source_files.id"), nullable=True)
    title = Column(String(255), default="Quick Analysis")
    language = Column(String(50), default="python")
    source_code = Column(Text, nullable=False)
    status = Column(String(50), default="completed") # pending, running, completed, failed
    error_message = Column(Text, nullable=True)
    
    # Aggregated metrics
    loc = Column(Integer, default=0)
    lloc = Column(Integer, default=0)
    sloc = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    avg_cyclomatic_complexity = Column(Float, default=1.0)
    max_cyclomatic_complexity = Column(Integer, default=1)
    maintainability_index = Column(Float, default=100.0)
    overall_time_complexity = Column(String(50), default="O(1)")
    overall_space_complexity = Column(String(50), default="O(1)")
    
    # Structural details
    functions_count = Column(Integer, default=0)
    classes_count = Column(Integer, default=0)
    max_nesting_depth = Column(Integer, default=0)
    
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.utcnow)
    execution_time_ms = Column(Float, default=0.0)
    engine_version = Column(String(20), default="1.0.0")

    source_file = relationship("SourceFile", back_populates="analyses")
    functions = relationship("FunctionMetric", back_populates="analysis", cascade="all, delete-orphan")
    findings = relationship("AnalysisFinding", back_populates="analysis", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="analysis", cascade="all, delete-orphan")

class FunctionMetric(Base):
    __tablename__ = "function_metrics"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    analysis_id = Column(String(36), ForeignKey("analysis_runs.id"), nullable=False)
    name = Column(String(255), nullable=False)
    line_start = Column(Integer, nullable=False)
    line_end = Column(Integer, nullable=False)
    cyclomatic_complexity = Column(Integer, default=1)
    cyclomatic_rank = Column(String(5), default="A") # A, B, C, D, E, F
    time_complexity = Column(String(50), default="O(1)")
    space_complexity = Column(String(50), default="O(1)")
    complexity_confidence = Column(String(20), default="high") # high, medium, low, unknown
    complexity_reasoning = Column(Text, default="")
    maintainability_index = Column(Float, default=100.0)
    parameters_count = Column(Integer, default=0)
    nesting_depth = Column(Integer, default=0)
    is_recursive = Column(Boolean, default=False)
    halstead_metrics = Column(JSON, default=dict)

    analysis = relationship("AnalysisRun", back_populates="functions")

class AnalysisFinding(Base):
    __tablename__ = "analysis_findings"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    analysis_id = Column(String(36), ForeignKey("analysis_runs.id"), nullable=False)
    rule_id = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False) # error, warning, info
    category = Column(String(50), default="maintainability") # complexity, performance, maintainability, design
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    why_it_matters = Column(Text, default="")
    suggested_action = Column(Text, default="")
    is_deterministic = Column(Boolean, default=True)
    line_number = Column(Integer, nullable=True)
    end_line_number = Column(Integer, nullable=True)
    function_name = Column(String(255), nullable=True)

    analysis = relationship("AnalysisRun", back_populates="findings")

class BenchmarkExperiment(Base):
    __tablename__ = "benchmark_experiments"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    function_name = Column(String(255), default="solution")
    code_snippet = Column(Text, nullable=False)
    input_type = Column(String(50), default="integer") # integer, array_int, string
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="benchmarks")
    results = relationship("BenchmarkResult", back_populates="experiment", cascade="all, delete-orphan")

class BenchmarkResult(Base):
    __tablename__ = "benchmark_results"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    experiment_id = Column(String(36), ForeignKey("benchmark_experiments.id"), nullable=False)
    input_size = Column(Integer, nullable=False)
    elapsed_time_ms = Column(Float, nullable=False)
    memory_peak_kb = Column(Float, default=0.0)
    iterations = Column(Integer, default=5)
    variance = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("BenchmarkExperiment", back_populates="results")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    analysis_id = Column(String(36), ForeignKey("analysis_runs.id"), nullable=False)
    format = Column(String(20), nullable=False) # pdf, json, csv
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("AnalysisRun", back_populates="reports")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    theme = Column(String(20), default="light")
    editor_font_size = Column(Integer, default=14)
    editor_tab_size = Column(Integer, default=4)
    default_language = Column(String(50), default="python")
    cc_warning_threshold = Column(Integer, default=10)
    cc_critical_threshold = Column(Integer, default=20)
    ai_explanations_enabled = Column(Boolean, default=False)
    dashboard_layout = Column(JSON, default=dict)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="preferences")
