import React from "react";
import {
  BookOpen,
  Code2,
  Activity,
  Layers,
  HelpCircle,
  ShieldAlert,
  Cpu,
  BarChart2
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export const DocsPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto text-slate-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          CodePulse Documentation & Metric Standards
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Technical specifications for computational complexity estimation, McCabe cyclomatic metrics, and maintainability indices.
        </p>
      </div>

      {/* Section 1: Cyclomatic Complexity */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-bold text-slate-900">
            1. McCabe Cyclomatic Complexity (CC)
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Formulated by Thomas J. McCabe in 1976, Cyclomatic Complexity measures the number of linearly independent paths through a program's source code. In graph theory, for a control-flow graph with <strong>E</strong> edges, <strong>N</strong> nodes, and <strong>P</strong> connected components:
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs text-center font-bold text-slate-900 my-2">
          M = E - N + 2P
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mt-3">
          CodePulse analyzes branch decision constructs: <code>if</code>, <code>while</code>, <code>for</code>, boolean operators (<code>and</code>, <code>or</code>), exception handlers (<code>except</code>), and comprehension generators.
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded bg-slate-50">
            <span className="font-bold text-slate-900 block">Rank A (1?5)</span>
            <span className="text-slate-500 text-[11px]">Low risk, simple</span>
          </div>
          <div className="p-2 rounded bg-slate-50">
            <span className="font-bold text-slate-900 block">Rank B (6?10)</span>
            <span className="text-slate-500 text-[11px]">Moderate complexity</span>
          </div>
          <div className="p-2 rounded bg-slate-50">
            <span className="font-bold text-amber-700 block">Rank C (11?20)</span>
            <span className="text-slate-500 text-[11px]">High risk, refactor</span>
          </div>
          <div className="p-2 rounded bg-slate-50">
            <span className="font-bold text-red-700 block">Rank D/F (21+)</span>
            <span className="text-slate-500 text-[11px]">Untestable danger</span>
          </div>
        </div>
      </Card>

      {/* Section 2: Halstead & Maintainability Index */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-5 w-5 text-indigo-700" />
          <h2 className="text-lg font-bold text-slate-900">
            2. Halstead Metrics & Maintainability Index (MI)
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Maurice Halstead's Software Science treats code as tokens comprising operators (<code>n1</code> unique, <code>N1</code> total) and operands (<code>n2</code> unique, <code>N2</code> total):
        </p>
        <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 my-3 pl-2">
          <li><strong>Volume (V):</strong> <code>(N1 + N2) * log2(n1 + n2)</code> ? Information content in bits.</li>
          <li><strong>Difficulty (D):</strong> <code>(n1 / 2) * (N2 / n2)</code> ? Propensity for error during coding.</li>
          <li><strong>Effort (E):</strong> <code>D * V</code> ? Mental effort to implement.</li>
        </ul>
        <p className="text-xs text-slate-600 leading-relaxed mt-2">
          The <strong>Maintainability Index (MI)</strong> is normalized to a 0?100 scale using the Software Engineering Institute (SEI) composite polynomial:
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-[11px] text-center text-slate-800 my-2">
          MI = 171 - 5.2?ln(V) - 0.23?CC - 16.2?ln(LOC) + 50?sin(?(2.4?perCM))
        </div>
      </Card>

      {/* Section 3: Algorithmic Asymptotic Complexity */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-bold text-slate-900">
            3. Algorithmic Complexity Estimation Model
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-3">
          CodePulse extracts concrete syntactic patterns from the Python Abstract Syntax Tree:
        </p>
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/70">
            <span className="font-bold font-mono text-brand-700">O(1) Constant: </span>
            <span className="text-slate-600">Pure sequential statements, arithmetic, and dictionary lookups without loops or recursion.</span>
          </div>
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/70">
            <span className="font-bold font-mono text-brand-700">O(log n) Logarithmic: </span>
            <span className="text-slate-600">While loops where the control variable is halved/divided (<code>//= 2</code>), or bisect operations.</span>
          </div>
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/70">
            <span className="font-bold font-mono text-brand-700">O(n) Linear: </span>
            <span className="text-slate-600">Single non-nested iteration traversing an input collection of length n.</span>
          </div>
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/70">
            <span className="font-bold font-mono text-brand-700">O(n log n) Linearithmic: </span>
            <span className="text-slate-600">Invocations of Timsort (<code>sorted()</code>, <code>list.sort()</code>) accompanied by linear operations.</span>
          </div>
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/70">
            <span className="font-bold font-mono text-brand-700">O(n?) Quadratic: </span>
            <span className="text-slate-600">Two nested loops iterating over input-dependent bounds.</span>
          </div>
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200/70">
            <span className="font-bold font-mono text-brand-700">O(2^n) Exponential: </span>
            <span className="text-slate-600">Multi-branch tree recursion (branching factor &ge; 2) without explicit memoization.</span>
          </div>
        </div>
      </Card>

      {/* Section 4: Traceability & Limits */}
      <Card className="border-brand-200 bg-brand-50/30">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="h-5 w-5 text-brand-600" />
          <h2 className="text-base font-bold text-slate-900">
            4. Scientific Traceability & Non-Claims
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          CodePulse static complexity inference is an automated syntactic heuristic, <strong>not a mathematical proof</strong>. Alan Turing's Halting Problem demonstrates that exact behavioral analysis of arbitrary programs is undecidable. Static analysis cannot predict input-dependent early returns, dynamic branch probabilities, or external hardware micro-architectures.
        </p>
      </Card>
    </div>
  );
};
