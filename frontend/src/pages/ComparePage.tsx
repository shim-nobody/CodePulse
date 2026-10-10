import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  GitCompare,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ComplexityBadge } from "../components/analysis/ComplexityBadge";
import { api } from "../lib/api";
import { CompareResponse } from "../types";

const DEFAULT_CODE_A = `def process_items(items):
    # Version A: string concatenation anti-pattern
    result = ""
    for item in items:
        result += str(item) + ","
    return result`;

const DEFAULT_CODE_B = `def process_items(items):
    # Version B: optimized linear memory join
    buffer = [str(item) for item in items]
    return ",".join(buffer)`;

export const ComparePage: React.FC = () => {
  const [codeA, setCodeA] = useState(DEFAULT_CODE_A);
  const [codeB, setCodeB] = useState(DEFAULT_CODE_B);
  const [isComparing, setIsComparing] = useState(false);
  const [comparison, setComparison] = useState<CompareResponse | null>(null);

  const handleCompare = async () => {
    try {
      setIsComparing(true);
      const res = await api.compareCode(codeA, codeB);
      setComparison(res);
      toast.success("Comparison evaluated!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to compare versions");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Side-by-Side Comparison Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare two implementation versions to verify complexity reductions and maintainability improvements.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleCompare} isLoading={isComparing}>
          <GitCompare className="h-4 w-4 mr-1.5" />
          <span>Compare Versions</span>
        </Button>
      </div>

      {/* Side-by-Side Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor A */}
        <Card className="p-0 overflow-hidden">
          <div className="bg-slate-100/70 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-700">Version A (Original)</span>
            <Badge variant="neutral" size="sm">Base</Badge>
          </div>
          <div className="h-64">
            <Editor
              height="100%"
              language="python"
              theme="light"
              value={codeA}
              onChange={(v) => setCodeA(v || "")}
              options={{ minimap: { enabled: false }, fontSize: 12, automaticLayout: true }}
            />
          </div>
        </Card>

        {/* Editor B */}
        <Card className="p-0 overflow-hidden">
          <div className="bg-slate-100/70 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-brand-700">Version B (Candidate)</span>
            <Badge variant="brand" size="sm">Modified</Badge>
          </div>
          <div className="h-64">
            <Editor
              height="100%"
              language="python"
              theme="light"
              value={codeB}
              onChange={(v) => setCodeB(v || "")}
              options={{ minimap: { enabled: false }, fontSize: 12, automaticLayout: true }}
            />
          </div>
        </Card>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Verdict Banner */}
          <div className="p-4 rounded-lg bg-white border border-brand-200 shadow-sm flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-brand-600 shrink-0" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Evaluation Verdict
              </div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">
                {comparison.summary_verdict}
              </div>
            </div>
          </div>

          {/* Metric Comparison Table */}
          <Card>
            <h3 className="font-bold text-base text-slate-900 mb-4">
              Quantitative Metrics Delta
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Metric</th>
                    <th className="pb-3 px-4">Version A</th>
                    <th className="pb-3 px-4">Version B</th>
                    <th className="pb-3 px-4">Difference</th>
                    <th className="pb-3 text-right">Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {comparison.metrics_comparison.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 font-sans font-semibold text-slate-900">
                        {m.metric_name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{String(m.value_a)}</td>
                      <td className="py-3 px-4 text-slate-900 font-bold">{String(m.value_b)}</td>
                      <td className="py-3 px-4">
                        {m.diff !== null && m.diff !== undefined ? (
                          <span
                            className={
                              m.diff < 0
                                ? "text-emerald-600 font-bold"
                                : m.diff > 0
                                ? "text-amber-600 font-bold"
                                : "text-slate-400"
                            }
                          >
                            {m.diff > 0 ? `+${m.diff}` : m.diff}
                          </span>
                        ) : (
                          <span className="text-slate-400">?</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {m.better === "B" ? (
                          <Badge variant="success" size="sm">Improved in B</Badge>
                        ) : m.better === "A" ? (
                          <Badge variant="warning" size="sm">Better in A</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">Equal</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quality Smells Diff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h4 className="font-bold text-sm text-emerald-700 flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4" />
                <span>Resolved Anti-Patterns ({comparison.findings_diff.resolved_findings_count})</span>
              </h4>
              {comparison.findings_diff.resolved_rules.length > 0 ? (
                <div className="space-y-2">
                  {comparison.findings_diff.resolved_rules.map((rule, i) => (
                    <div key={i} className="p-2.5 rounded bg-emerald-50 text-emerald-800 text-xs font-mono">
                      ? {rule} resolved in Version B
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No anti-patterns eliminated between versions.</p>
              )}
            </Card>

            <Card>
              <h4 className="font-bold text-sm text-amber-700 flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4" />
                <span>New Findings in B ({comparison.findings_diff.new_findings_count})</span>
              </h4>
              {comparison.findings_diff.new_rules.length > 0 ? (
                <div className="space-y-2">
                  {comparison.findings_diff.new_rules.map((rule, i) => (
                    <div key={i} className="p-2.5 rounded bg-amber-50 text-amber-800 text-xs font-mono">
                      ! {rule} newly detected in Version B
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No new code smells introduced in candidate version.</p>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
