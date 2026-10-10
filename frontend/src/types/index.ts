export interface FunctionMetric {
  id: string;
  name: string;
  line_start: number;
  line_end: number;
  cyclomatic_complexity: number;
  cyclomatic_rank: string;
  time_complexity: string;
  space_complexity: string;
  complexity_confidence: string;
  complexity_reasoning: string;
  maintainability_index: number;
  parameters_count: number;
  nesting_depth: number;
  is_recursive: boolean;
  halstead_metrics: {
    volume?: number;
    difficulty?: number;
    effort?: number;
    time_seconds?: number;
    estimated_bugs?: number;
  };
}

export interface Finding {
  id?: string;
  rule_id: string;
  severity: "error" | "warning" | "info";
  category: "complexity" | "performance" | "maintainability" | "design";
  title: string;
  description: string;
  why_it_matters: string;
  suggested_action: string;
  is_deterministic: boolean;
  line_number?: number;
  end_line_number?: number;
  function_name?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  severity: string;
  problem: string;
  supporting_evidence: string;
  suggested_improvement: string;
  expected_benefit: string;
  tradeoffs: string;
  safe_to_apply: boolean;
  refactored_code?: string;
  line_number?: number;
}

export interface ASTNode {
  id: string;
  label: string;
  type: string;
  line?: number;
  details?: Record<string, any>;
  children?: ASTNode[];
}

export interface GraphNode {
  id: string;
  data: Record<string, any>;
  position: { x: number; y: number };
  type?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface CallGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AnalysisResponse {
  id: string;
  title: string;
  language: string;
  source_code: string;
  status: "completed" | "failed" | "pending";
  error_message?: string;
  loc: number;
  lloc: number;
  sloc: number;
  comments: number;
  avg_cyclomatic_complexity: number;
  max_cyclomatic_complexity: number;
  maintainability_index: number;
  overall_time_complexity: string;
  overall_space_complexity: string;
  functions: FunctionMetric[];
  findings: Finding[];
  recommendations: Recommendation[];
  ast_tree?: ASTNode;
  call_graph?: CallGraph;
  started_at: string;
  completed_at: string;
  execution_time_ms: number;
  engine_version: string;
}

export interface Project {
  id: string;
  user_id?: string;
  name: string;
  description: string;
  language: string;
  created_at: string;
  updated_at: string;
  files_count?: number;
  analyses_count?: number;
  avg_complexity?: number;
}

export interface BenchmarkResult {
  input_size: number;
  elapsed_time_ms: number;
  memory_peak_kb: number;
  iterations: number;
  variance: number;
}

export interface BenchmarkSample {
  id: string;
  name: string;
  expected_complexity: string;
  code: string;
  input_type: string;
  input_sizes: number[];
}

export interface CompareMetricDiff {
  metric_name: string;
  value_a: any;
  value_b: any;
  diff?: number;
  better?: "A" | "B" | "EQUAL" | "NEUTRAL";
}

export interface CompareResponse {
  analysis_a: AnalysisResponse;
  analysis_b: AnalysisResponse;
  metrics_comparison: CompareMetricDiff[];
  findings_diff: {
    resolved_findings_count: number;
    new_findings_count: number;
    resolved_rules: string[];
    new_rules: string[];
  };
  summary_verdict: string;
}

export interface DashboardSummary {
  total_analyses: number;
  avg_cyclomatic_complexity: number;
  avg_maintainability_index: number;
  flagged_functions_count: number;
  recent_activity: Array<{
    id: string;
    title: string;
    language: string;
    loc: number;
    avg_cc: number;
    mi: number;
    overall_time: string;
    status: string;
    date: string;
  }>;
  complexity_distribution: Array<{
    rank: string;
    count: number;
    range: string;
  }>;
}

export interface UserPreferences {
  theme: "light" | "dark";
  editor_font_size: number;
  editor_tab_size: number;
  default_language: string;
  cc_warning_threshold: number;
  cc_critical_threshold: number;
  ai_explanations_enabled: boolean;
}
