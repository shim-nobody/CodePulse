import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Code2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Download,
  Trash2,
  GitCompare,
  ArrowRight,
  RefreshCw,
  Eye,
  FileText
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import toast from "react-hot-toast";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { ComplexityBadge } from "../components/analysis/ComplexityBadge";
import { api } from "../lib/api";
import { DashboardSummary } from "../types";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err: any) {
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.deleteAnalysis(deleteTargetId);
      toast.success("Analysis deleted");
      setDeleteTargetId(null);
      fetchDashboard();
    } catch (err) {
      toast.error("Failed to delete analysis");
    }
  };

  const COLORS = ["#2563EB", "#4338CA", "#15803D", "#B45309", "#B91C1C", "#64748B"];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Analytics Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time static code complexity and performance health metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboard}
            isLoading={loading}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            <span>Refresh</span>
          </Button>
          <Link to="/analyze">
            <Button variant="primary" size="sm">
              <Code2 className="h-4 w-4 mr-1.5" />
              <span>New Analysis</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Analyses
            </span>
            <div className="h-8 w-8 rounded bg-brand-50 text-brand-600 flex items-center justify-center">
              <Code2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data?.total_analyses ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span>Stored analysis sessions</span>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Cyclomatic CC
            </span>
            <div className="h-8 w-8 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data?.avg_cyclomatic_complexity?.toFixed(1) ?? "1.0"}
          </div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <span>McCabe score per routine</span>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Flagged for Review
            </span>
            <div className="h-8 w-8 rounded bg-amber-50 text-warning flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data?.flagged_functions_count ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Functions with CC &gt; 10
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Maintainability
            </span>
            <div className="h-8 w-8 rounded bg-emerald-50 text-success flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data?.avg_maintainability_index?.toFixed(1) ?? "85.0"}
            <span className="text-sm font-normal text-slate-400 ml-1">/ 100</span>
          </div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">
            High maintainability index
          </div>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Cyclomatic Complexity Distribution */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-slate-900">
                Complexity Distribution (McCabe Ranks)
              </h2>
              <Badge variant="brand" size="sm">
                AST Branch Ranks
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Distribution of analyzed functions by cyclomatic complexity rank: Rank A (1?5), Rank B (6?10), Rank C (11?20), Rank D (21+).
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.complexity_distribution || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="rank" tickLine={false} stroke="#94A3B8" fontSize={12} />
                <YAxis tickLine={false} stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  cursor={{ fill: "#F8FAFC" }}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: 8, border: "1px solid #E2E8F0" }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Analysis History Timeline */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-slate-900">
                Maintainability Trend
              </h2>
              <Badge variant="indigo" size="sm">
                SEI Standard Index
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Sequential maintainability scores across recent code submissions.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data?.recent_activity || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="title" tickLine={false} stroke="#94A3B8" fontSize={10} tickFormatter={(val) => val.slice(0, 10)} />
                <YAxis domain={[0, 100]} tickLine={false} stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: 8, border: "1px solid #E2E8F0" }}
                />
                <Line type="monotone" dataKey="mi" stroke="#4338CA" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-base text-slate-900">
              Recent Code Analyses
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Persistent records of submitted source files, complexity classifications, and actions.
            </p>
          </div>
          <Link to="/analyze">
            <Button variant="outline" size="sm">
              <span>Inspect New Code</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pr-4">Analysis Name</th>
                <th className="pb-3 px-4">LOC</th>
                <th className="pb-3 px-4">Avg CC</th>
                <th className="pb-3 px-4">Maintainability</th>
                <th className="pb-3 px-4">Time Complexity</th>
                <th className="pb-3 px-4">Date</th>
                <th className="pb-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recent_activity?.length ? (
                data.recent_activity.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pr-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand-600 shrink-0" />
                        <span className="truncate max-w-[200px]">{item.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{item.loc}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{item.avg_cc}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-emerald-600">
                      {item.mi} / 100
                    </td>
                    <td className="py-3.5 px-4">
                      <ComplexityBadge notation={item.overall_time} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{item.date}</td>
                    <td className="py-3.5 pl-4 text-right space-x-2 whitespace-nowrap">
                      {/* View Action */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/analyze?id=${item.id}`)}
                        className="p-1.5 h-8 text-slate-600 hover:text-brand-600"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* Export Action */}
                      <a
                        href={api.getReportDownloadUrl(item.id, "pdf")}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-1.5 h-8 w-8 rounded text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                        title="Export PDF"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      {/* Delete Action */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTargetId(item.id)}
                        className="p-1.5 h-8 text-slate-600 hover:text-danger"
                        title="Delete Analysis"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No analyses recorded yet. Run your first analysis in the Code Workspace.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal for Deletion */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Delete Analysis Record"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this analysis session? This action permanently removes all associated function metrics, AST snapshots, and findings from the database.
        </p>
      </Modal>
    </div>
  );
};
