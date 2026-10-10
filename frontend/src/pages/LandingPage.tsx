import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  Activity,
  Layers,
  Cpu,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Terminal,
  ShieldAlert,
  FileText,
  BarChart2,
  Workflow
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { ComplexityBadge } from "../components/analysis/ComplexityBadge";

export const LandingPage: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<"merge" | "bubble">("merge");

  const demoResults = {
    merge: {
      name: "merge_sort(arr)",
      time: "O(n log n)",
      space: "O(n)",
      cc: 3,
      mi: 88.5,
      loc: 18,
      confidence: "high",
      reasoning: "Combines divide-and-conquer sub-arrays with linear-time merging pass.",
      code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)`
    },
    bubble: {
      name: "bubble_sort(arr)",
      time: "O(n?)",
      space: "O(1)",
      cc: 4,
      mi: 74.2,
      loc: 10,
      confidence: "high",
      reasoning: "Two nested loops iterate over input collection resulting in quadratic comparisons.",
      code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`
    }
  };

  const current = demoResults[selectedDemo];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur sticky top-0 z-30 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-sm font-mono font-bold text-lg">
            ?
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            CodePulse
          </span>
          <Badge variant="brand" size="sm" className="ml-1">
            v1.0
          </Badge>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link to="/analyze" className="hover:text-slate-900 transition-colors">
            Analyzer
          </Link>
          <Link to="/benchmarks" className="hover:text-slate-900 transition-colors">
            Benchmarks
          </Link>
          <Link to="/docs" className="hover:text-slate-900 transition-colors">
            Methodology & Docs
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
          <Link to="/analyze">
            <Button variant="primary" size="sm">
              <span>Launch Studio</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-16 md:py-24 px-6 lg:px-12 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold mb-6">
          <Zap className="h-3.5 w-3.5" />
          <span>Algorithmic Complexity & Static Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
          Deep Code Inspection,{" "}
          <span className="bg-gradient-to-r from-brand-600 to-indigo-700 bg-clip-text text-transparent">
            Algorithmic Rigor
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          Estimate asymptotic time and memory complexity, compute McCabe?s cyclomatic metrics, calculate Halstead maintainability indices, and extract interactive AST / Call Graphs in real-time.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/analyze">
            <Button variant="primary" size="lg" className="shadow-md">
              <Code2 className="h-5 w-5 mr-2" />
              <span>Analyze Your Code</span>
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg">
              <Activity className="h-5 w-5 mr-2" />
              <span>Explore Analytics Dashboard</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Live Interactive Demo Box */}
      <section className="px-6 lg:px-12 max-w-5xl mx-auto w-full mb-24">
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* Header Bar */}
          <div className="bg-slate-900 text-slate-200 px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-mono text-slate-400 ml-3">
                live_static_analyzer.py
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDemo("merge")}
                className={`text-xs px-2.5 py-1 rounded transition-colors font-mono ${
                  selectedDemo === "merge"
                    ? "bg-brand-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Merge Sort
              </button>
              <button
                onClick={() => setSelectedDemo("bubble")}
                className={`text-xs px-2.5 py-1 rounded transition-colors font-mono ${
                  selectedDemo === "bubble"
                    ? "bg-brand-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Bubble Sort
              </button>
            </div>
          </div>

          {/* Body Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Code Panel */}
            <div className="p-6 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto">
              <pre className="leading-relaxed">{current.code}</pre>
            </div>

            {/* Live Metrics Output Panel */}
            <div className="p-6 bg-white space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Target Subroutine
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900">
                    {current.name}
                  </div>
                </div>
                <ComplexityBadge
                  notation={current.time}
                  confidence={current.confidence}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="text-[11px] text-slate-500 font-medium">Time Comp.</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {current.time}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="text-[11px] text-slate-500 font-medium">Space Comp.</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {current.space}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="text-[11px] text-slate-500 font-medium">Cyclomatic</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {current.cc} (Rank A)
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="text-[11px] text-slate-500 font-medium">Maintainability</div>
                  <div className="text-sm font-bold font-mono text-emerald-600 mt-0.5">
                    {current.mi}/100
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Structural Evidence & Reasoning
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200/60">
                  {current.reasoning}
                </p>
              </div>

              <Link to="/analyze">
                <Button variant="primary" size="sm" className="w-full">
                  <span>Open Full Analysis Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 px-6 lg:px-12 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Four Pillars of Algorithmic Intelligence
            </h2>
            <p className="text-sm md:text-base text-slate-600 mt-3">
              Combines formal deterministic metrics, structural heuristic analysis, and empirical bench testing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hover className="flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">
                  Algorithmic Complexity
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Estimates time and space complexity with traceable structural evidence, explicit assumptions, and confidence ratings.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-brand-600">
                O(1) to O(2^n) patterns
              </div>
            </Card>

            <Card hover className="flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">
                  Maintainability & Metrics
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Calculates McCabe Cyclomatic Complexity, Halstead Difficulty, Volume, Effort, and standard Maintainability Indices.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-indigo-700">
                Radon & AST integrated
              </div>
            </Card>

            <Card hover className="flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <Workflow className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">
                  AST & Call Graph Visuals
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Explore syntax hierarchies and interconnected function call relationships rendered via interactive node graphs.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-amber-700">
                Interactive React Flow
              </div>
            </Card>

            <Card hover className="flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">
                  Empirical Benchmark Lab
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Stress-test implementations against synthetic scales (100 to 50,000 inputs) in isolated sandboxes with runtime plots.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700">
                Sandbox execution
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Limitations & Honesty Section */}
      <section className="py-16 px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="h-6 w-6 text-brand-600 shrink-0" />
            <h2 className="text-lg font-bold text-slate-900">
              Engineering Honesty & Architectural Limitations
            </h2>
          </div>
          <div className="space-y-3 text-xs md:text-sm text-slate-600 leading-relaxed">
            <p>
              ? <strong>Deterministic vs Heuristic:</strong> Lines of code, cyclomatic complexity, and Halstead calculations are mathematically deterministic. Algorithmic Big-O estimates are static structural heuristics based on recognizable syntax patterns.
            </p>
            <p>
              ? <strong>Uncertainty Labeling:</strong> CodePulse never claims that an estimated complexity is a formal mathematical proof. Where runtime bounds depend on dynamic data distribution, results are explicitly marked with documented confidence categories.
            </p>
            <p>
              ? <strong>Language Support:</strong> Python 3 AST parsing and metrics are supported natively in release v1.0. Language adapter interfaces are isolated for future extensions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-12 px-6 lg:px-12 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
              CP
            </div>
            <span className="font-bold text-slate-900">CodePulse</span>
            <span>? Intelligent Code Complexity Analyzer</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/docs" className="hover:text-slate-900 transition-colors">
              Documentation
            </Link>
            <Link to="/analyze" className="hover:text-slate-900 transition-colors">
              Workspace
            </Link>
            <Link to="/benchmarks" className="hover:text-slate-900 transition-colors">
              Benchmarks
            </Link>
            <Link to="/settings" className="hover:text-slate-900 transition-colors">
              Preferences
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
