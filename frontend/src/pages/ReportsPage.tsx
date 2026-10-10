import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Download,
  Calendar,
  Code2,
  ExternalLink,
  RefreshCw,
  FileSpreadsheet,
  FileJson
} from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ComplexityBadge } from "../components/analysis/ComplexityBadge";
import { api } from "../lib/api";

export const ReportsPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const res = await api.getRecentAnalyses(25);
      setAnalyses(res);
    } catch (err) {
      toast.error("Failed to load report archives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Generated Analysis Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Export comprehensive formal audit reports in publication-ready PDF, structured JSON, or tabular CSV.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalyses} isLoading={loading}>
          <RefreshCw className="h-4 w-4 mr-1.5" />
          <span>Refresh List</span>
        </Button>
      </div>

      {/* Reports Table Card */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pr-4">Analysis Target</th>
                <th className="pb-3 px-4">LOC</th>
                <th className="pb-3 px-4">Cyclomatic CC</th>
                <th className="pb-3 px-4">Maintainability</th>
                <th className="pb-3 px-4">Complexity</th>
                <th className="pb-3 px-4">Date</th>
                <th className="pb-3 pl-4 text-right">Download Formats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analyses.length > 0 ? (
                analyses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand-600 shrink-0" />
                        <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{item.loc}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{item.avg_cyclomatic_complexity}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-emerald-600">
                      {item.maintainability_index} / 100
                    </td>
                    <td className="py-3.5 px-4">
                      <ComplexityBadge notation={item.overall_time_complexity} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(item.started_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 pl-4 text-right space-x-2 whitespace-nowrap">
                      {/* PDF */}
                      <a
                        href={api.getReportDownloadUrl(item.id, "pdf")}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-50 text-brand-700 hover:bg-brand-100 font-semibold text-xs transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        <span>PDF</span>
                      </a>
                      {/* CSV */}
                      <a
                        href={api.getReportDownloadUrl(item.id, "csv")}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors"
                      >
                        <FileSpreadsheet className="h-3 w-3" />
                        <span>CSV</span>
                      </a>
                      {/* JSON */}
                      <a
                        href={api.getReportDownloadUrl(item.id, "json")}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors"
                      >
                        <FileJson className="h-3 w-3" />
                        <span>JSON</span>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No stored reports available. Execute an analysis in the Workspace first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
