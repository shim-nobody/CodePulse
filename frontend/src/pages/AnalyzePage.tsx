import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  Play,
  Code2,
  RotateCcw,
  Download,
  Share2,
  GitCompare,
  Upload,
  AlertCircle,
  FileCode,
  Layers,
  Cpu,
  Activity,
  CheckCircle2,
  Workflow,
  Sparkles,
  Info,
  Save,
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { Modal } from "../components/ui/Modal";
import { ComplexityBadge } from "../components/analysis/ComplexityBadge";
import { ASTGraphViewer } from "../components/analysis/ASTGraphViewer";
import { CallGraphViewer } from "../components/analysis/CallGraphViewer";
import { api } from "../lib/api";
import { AnalysisResponse } from "../types";

const SAMPLES: Record<string, { title: string; code: string }> = {
  merge_sort: {
    title: "Merge Sort (Divide & Conquer)",
    code: `def merge_sort(arr):
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
    return result`
  },
  bubble_sort: {
    title: "Bubble Sort (Nested Quadratic)",
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`
  },
  fibonacci_tree: {
    title: "Recursive Fibonacci (Exponential Tree)",
    code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

def compute_sequence(limit):
    results = []
    for i in range(limit):
        results.append(fibonacci(i))
    return results`
  },
  string_concat_smell: {
    title: "String Accumulation Smell (Quadratic Realloc)",
    code: `def build_report(records):
    header = "AUDIT LOG\\n"
    # Anti-pattern: string += inside loop
    for rec in records:
        header += "ID: " + str(rec["id"]) + " -> " + rec["name"] + "\\n"
    return header`
  }
};

export const AnalyzePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [code, setCode] = useState<string>(SAMPLES.merge_sort.code);
  const [title, setTitle] = useState<string>("Interactive Analysis");
  const [activeTab, setActiveTab] = useState<string>("functions");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load analysis if ID in query params
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      api.getAnalysis(id).then((res) => {
        setResult(res);
        setCode(res.source_code);
        setTitle(res.title);
      }).catch(() => {
        toast.error("Could not load requested analysis");
      });
    }
  }, [searchParams]);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error("Please enter Python source code to analyze");
      return;
    }
    try {
      setIsAnalyzing(true);
      const res = await api.analyzeCode(code, title, "main.py");
      setResult(res);
      if (res.status === "failed") {
        toast.error(res.error_message || "Parser error detected");
      } else {
        toast.success("Analysis complete");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to execute analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".py")) {
      toast.error("Only Python (.py) files are supported in this release");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCode(content);
      setTitle(file.name);
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleSelectSample = (key: string) => {
    const s = SAMPLES[key];
    if (s) {
      setCode(s.code);
      setTitle(s.title);
      toast.success(`Loaded sample: ${s.title}`);
    }
  };

  const handleSaveToProject = async () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    try {
      await api.createProject(projectName, `Contains analysis: ${title}`, "python");
      toast.success("Saved to Projects!");
      setSaveModalOpen(false);
      setProjectName("");
    } catch (err) {
      toast.error("Failed to save project");
    }
  };

  const tabs = [
    { id: "functions", label: "Function Metrics", count: result?.functions?.length },
    { id: "findings", label: "Quality Smells", count: result?.findings?.length },
    { id: "recommendations", label: "Optimization Advisor", count: result?.recommendations?.length },
    { id: "ast", label: "AST Hierarchy" },
    { id: "callgraph", label: "Call Graph" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-semibold text-slate-900 border border-slate-200 rounded px-2.5 py-1 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 max-w-[240px]"
            placeholder="Analysis Title"
          />

          {/* Sample Select */}
          <select
            onChange={(e) => handleSelectSample(e.target.value)}
            defaultValue=""
            className="text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="" disabled>Load Sample Algorithm...</option>
            <option value="merge_sort">Merge Sort (O(n log n))</option>
            <option value="bubble_sort">Bubble Sort (O(n?))</option>
            <option value="fibonacci_tree">Recursive Fibonacci (O(2^n))</option>
            <option value="string_concat_smell">String Concatenation Smell</option>
          </select>

          {/* Upload file hidden */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".py"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 mr-1" />
            <span>Upload .py</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCode("");
              setResult(null);
            }}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span>Clear</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {result && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/compare?idA=${result.id}`)}
              >
                <GitCompare className="h-3.5 w-3.5 mr-1" />
                <span>Compare</span>
              </Button>
              <a
                href={api.getReportDownloadUrl(result.id, "pdf")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded text-xs font-medium"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                <span>PDF Report</span>
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSaveModalOpen(true)}
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                <span>Save</span>
              </Button>
            </>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
          >
            <Play className="h-3.5 w-3.5 mr-1 fill-current" />
            <span>Analyze Code</span>
          </Button>
        </div>
      </div>

      {/* Main Workspace Layout (Editor + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Monaco Editor (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg shadow-card overflow-hidden">
          <div className="bg-slate-100/70 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-mono text-slate-600">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-brand-600" />
              <span>Python 3 Source</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {code.split("\n").length} lines
            </span>
          </div>
          <div className="h-[560px] w-full">
            <Editor
              height="100%"
              language="python"
              theme="light"
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Right Side: Analysis Results Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result?.error_message ? (
            <Card className="border-red-200 bg-red-50/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-danger text-sm">
                    Parser Validation Error
                  </h3>
                  <p className="text-xs text-red-700 mt-1 font-mono leading-relaxed">
                    {result.error_message}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Review Python syntax at the indicated line to enable AST metrics extraction.
                  </p>
                </div>
              </div>
            </Card>
          ) : result ? (
            <>
              {/* Executive Summary Metrics Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-3 text-center">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Time Complexity
                  </div>
                  <div className="mt-1">
                    <ComplexityBadge notation={result.overall_time_complexity} />
                  </div>
                </Card>

                <Card className="p-3 text-center">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Auxiliary Space
                  </div>
                  <div className="mt-1 font-mono font-bold text-sm text-slate-900">
                    {result.overall_space_complexity}
                  </div>
                </Card>

                <Card className="p-3 text-center">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Cyclomatic (Avg)
                  </div>
                  <div className="mt-1 font-mono font-bold text-sm text-brand-600">
                    {result.avg_cyclomatic_complexity} (Max: {result.max_cyclomatic_complexity})
                  </div>
                </Card>

                <Card className="p-3 text-center">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Maintainability
                  </div>
                  <div className="mt-1 font-mono font-bold text-sm text-emerald-600">
                    {result.maintainability_index} / 100
                  </div>
                </Card>
              </div>

              {/* Detailed Results Tabs */}
              <Card className="p-0 overflow-hidden">
                <div className="px-6 pt-2 bg-slate-50/50 border-b border-slate-100">
                  <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
                </div>

                <div className="p-6">
                  {/* TAB 1: Function Metrics */}
                  {activeTab === "functions" && (
                    <div className="space-y-4">
                      {result.functions.length > 0 ? (
                        result.functions.map((fn) => (
                          <div
                            key={fn.id}
                            className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-slate-900">
                                  {fn.name}()
                                </span>
                                <Badge variant="neutral" size="sm">
                                  lines {fn.line_start}?{fn.line_end}
                                </Badge>
                                {fn.is_recursive && (
                                  <Badge variant="warning" size="sm">
                                    Recursive
                                  </Badge>
                                )}
                              </div>
                              <ComplexityBadge
                                notation={fn.time_complexity}
                                confidence={fn.complexity_confidence}
                              />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 mt-3 pt-1">
                              <div>
                                <span className="text-slate-400">Cyclomatic CC: </span>
                                <span className="font-bold text-slate-900">{fn.cyclomatic_complexity}</span> ({fn.cyclomatic_rank})
                              </div>
                              <div>
                                <span className="text-slate-400">Aux Space: </span>
                                <span className="font-bold text-slate-900">{fn.space_complexity}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Parameters: </span>
                                <span className="font-bold text-slate-900">{fn.parameters_count}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Nesting Depth: </span>
                                <span className="font-bold text-slate-900">{fn.nesting_depth}</span>
                              </div>
                            </div>

                            {fn.complexity_reasoning && (
                              <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100/80 leading-relaxed">
                                <span className="font-semibold text-slate-700">Reasoning: </span>
                                {fn.complexity_reasoning}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          No top-level or method function definitions found in source code.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Quality Smells */}
                  {activeTab === "findings" && (
                    <div className="space-y-3">
                      {result.findings.length > 0 ? (
                        result.findings.map((finding, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border text-xs ${
                              finding.severity === "error"
                                ? "bg-red-50/40 border-red-200 text-red-900"
                                : finding.severity === "warning"
                                ? "bg-amber-50/40 border-amber-200 text-amber-900"
                                : "bg-slate-50 border-slate-200 text-slate-900"
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold mb-1">
                              <span className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    finding.severity === "error"
                                      ? "danger"
                                      : finding.severity === "warning"
                                      ? "warning"
                                      : "neutral"
                                  }
                                  size="sm"
                                >
                                  {finding.rule_id}
                                </Badge>
                                <span>{finding.title}</span>
                              </span>
                              {finding.line_number && (
                                <span className="text-slate-500 font-mono">
                                  line {finding.line_number}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-slate-700 leading-relaxed">
                              {finding.description}
                            </p>
                            <div className="mt-2 pt-2 border-t border-slate-200/60 text-slate-600">
                              <span className="font-semibold">Why it matters: </span>
                              {finding.why_it_matters}
                            </div>
                            <div className="mt-1 text-slate-600">
                              <span className="font-semibold">Action: </span>
                              {finding.suggested_action}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-emerald-600 text-xs flex flex-col items-center gap-2">
                          <CheckCircle2 className="h-6 w-6" />
                          <span>No critical anti-patterns or code smells detected!</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Optimization Recommendations */}
                  {activeTab === "recommendations" && (
                    <div className="space-y-4">
                      {result.recommendations.length > 0 ? (
                        result.recommendations.map((rec) => (
                          <div
                            key={rec.id}
                            className="p-4 rounded-lg border border-slate-200 bg-white text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                              <span>{rec.title}</span>
                              <Badge variant={rec.safe_to_apply ? "success" : "warning"} size="sm">
                                {rec.safe_to_apply ? "Safe Transformation" : "Manual Refactor"}
                              </Badge>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                              {rec.suggested_improvement}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-500 pt-1">
                              <div>
                                <span className="font-semibold text-slate-700">Expected Benefit: </span>
                                {rec.expected_benefit}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-700">Trade-offs: </span>
                                {rec.tradeoffs}
                              </div>
                            </div>
                            {rec.refactored_code && (
                              <div className="mt-2 p-3 bg-slate-950 text-slate-100 rounded font-mono text-[11px] overflow-x-auto">
                                <pre>{rec.refactored_code}</pre>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          No automated optimization recommendations for this code snippet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: AST Hierarchy */}
                  {activeTab === "ast" && (
                    <div>
                      <div className="text-xs text-slate-500 mb-2">
                        Interactive Abstract Syntax Tree graph. Zoom and drag to explore nested syntax nodes.
                      </div>
                      <ASTGraphViewer tree={result.ast_tree} />
                    </div>
                  )}

                  {/* TAB 5: Call Graph */}
                  {activeTab === "callgraph" && (
                    <div>
                      <div className="text-xs text-slate-500 mb-2">
                        Interactive call graph depicting caller and callee relationships between defined routines.
                      </div>
                      <CallGraphViewer graph={result.call_graph} />
                    </div>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <Card className="h-[400px] flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Code2 className="h-10 w-10 text-slate-300 mb-3" />
              <h3 className="font-semibold text-slate-700 text-sm">
                Ready for Analysis
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Click <strong>Analyze Code</strong> above or select a sample algorithm to evaluate computational complexity, McCabe cyclomatic branching, and AST structures.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Save Project Modal */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save Analysis to Project"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveToProject}>
              Save Project
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 block">
            Project Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Sorting Algorithms Comparison"
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </Modal>
    </div>
  );
};
