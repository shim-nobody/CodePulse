import React, { useState } from "react";
import {
  GitBranch,
  Upload,
  FolderArchive,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  BarChart2,
  Layers,
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ComplexityBadge } from "../components/analysis/ComplexityBadge";
import { api } from "../lib/api";

export const RepositoriesPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("Python Repository");
  const [isScanning, setIsScanning] = useState(false);
  const [repoResult, setRepoResult] = useState<any | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith(".zip")) {
      setFile(dropped);
      setProjectName(dropped.name.replace(".zip", ""));
    } else {
      toast.error("Please drop a valid .zip archive");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a .zip archive first");
      return;
    }
    try {
      setIsScanning(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_name", projectName);
      const res = await api.uploadRepositoryZip(formData);
      setRepoResult(res);
      toast.success("Repository scan complete!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to scan repository archive");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Repository Analysis Scanner
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Scan entire codebases from ZIP archives to aggregate cyclomatic complexity and identify high-risk routines.
        </p>
      </div>

      {/* Upload Zone */}
      <Card>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-brand-500 transition-colors bg-slate-50/50"
        >
          <FolderArchive className="h-10 w-10 text-brand-600 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-sm">
            Drag & Drop Repository Archive (.zip)
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Upload your project bundle. CodePulse will parse all Python files, filter vendor directories (.venv, __pycache__, node_modules), and compute multi-file metrics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile(f);
                    setProjectName(f.name.replace(".zip", ""));
                  }
                }}
              />
              <span className="inline-flex items-center px-4 py-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded text-xs font-semibold shadow-sm">
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Select ZIP File
              </span>
            </label>

            {file && (
              <span className="text-xs font-mono font-medium text-slate-700 bg-white px-3 py-2 rounded border border-slate-200">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </span>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={handleUpload}
              disabled={!file}
              isLoading={isScanning}
            >
              <GitBranch className="h-4 w-4 mr-1.5" />
              <span>Start Repository Scan</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Results View */}
      {repoResult && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="text-xs font-semibold text-slate-400 uppercase">
                Files Processed
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {repoResult.files_analyzed_count}
              </div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-xs font-semibold text-slate-400 uppercase">
                Total Code Volume
              </div>
              <div className="text-2xl font-bold font-mono text-brand-600 mt-1">
                {repoResult.total_loc} LOC
              </div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-xs font-semibold text-slate-400 uppercase">
                Repo Avg Cyclomatic CC
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-700 mt-1">
                {repoResult.avg_cyclomatic_complexity}
              </div>
            </Card>
          </div>

          {/* Top Most Complex Functions */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Most Complex Routines Ranked
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Functions with highest branching density requiring prioritary unit testing and refactoring.
                </p>
              </div>
              <Badge variant="warning" size="sm">
                Attention Required
              </Badge>
            </div>

            <div className="divide-y divide-slate-100">
              {repoResult.top_complex_functions?.map((fn: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {fn.name}()
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      {fn.file} ? lines {fn.line_start}?{fn.line_end}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 font-semibold">
                      CC: {fn.cyclomatic_complexity} ({fn.cyclomatic_rank})
                    </span>
                    <ComplexityBadge notation={fn.time_complexity} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* File Metrics Breakdown */}
          <Card>
            <h3 className="font-bold text-base text-slate-900 mb-4">
              Source File Metrics
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pr-4">File Name</th>
                    <th className="pb-3 px-4">LOC</th>
                    <th className="pb-3 px-4">Avg CC</th>
                    <th className="pb-3 px-4">Maintainability</th>
                    <th className="pb-3 px-4">Dominant Time</th>
                    <th className="pb-3 pl-4">Functions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {repoResult.files?.map((f: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 pr-4 font-semibold text-slate-900">
                        {f.filename}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{f.loc}</td>
                      <td className="py-3 px-4 text-slate-600">{f.avg_cc}</td>
                      <td className="py-3 px-4 text-emerald-600 font-bold">{f.mi}/100</td>
                      <td className="py-3 px-4">
                        <ComplexityBadge notation={f.time_complexity} />
                      </td>
                      <td className="py-3 pl-4 text-slate-600">{f.functions_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
