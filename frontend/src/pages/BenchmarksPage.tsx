import React, { useState, useEffect } from "react";
import {
  Timer,
  Play,
  Download,
  AlertTriangle,
  Cpu,
  BarChart2,
  TrendingUp,
  Layers,
  ShieldCheck
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import toast from "react-hot-toast";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ComplexityBadge } from "../components/analysis/ComplexityBadge";
import { api } from "../lib/api";
import { BenchmarkSample, BenchmarkResult } from "../types";

export const BenchmarksPage: React.FC = () => {
  const [samples, setSamples] = useState<BenchmarkSample[]>([]);
  const [selectedSample, setSelectedSample] = useState<BenchmarkSample | null>(null);
  const [code, setCode] = useState<string>("");
  const [functionName, setFunctionName] = useState<string>("solution");
  const [inputSizes, setInputSizes] = useState<string>("100, 500, 1000, 2500, 5000");
  const [inputType, setInputType] = useState<string>("array_int");
  const [iterations, setIterations] = useState<number>(3);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<BenchmarkResult[] | null>(null);

  useEffect(() => {
    api.getBenchmarkSamples().then((res) => {
      setSamples(res);
      if (res.length > 0) {
        setSelectedSample(res[0]);
        setCode(res[0].code);
        setInputSizes(res[0].input_sizes.join(", "));
        setInputType(res[0].input_type);
      }
    }).catch(() => {
      toast.error("Could not load benchmark templates");
    });
  }, []);

  const handleSelectSample = (sample: BenchmarkSample) => {
    setSelectedSample(sample);
    setCode(sample.code);
    setInputSizes(sample.input_sizes.join(", "));
    setInputType(sample.input_type);
    setResults(null);
  };

  const handleRunBenchmark = async () => {
    const parsedSizes = inputSizes
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    if (parsedSizes.length === 0) {
      toast.error("Please enter at least one valid integer input size");
      return;
    }

    try {
      setIsRunning(true);
      const res = await api.runBenchmark(code, functionName, parsedSizes, inputType);
      setResults(res);
      toast.success("Benchmark completed successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Benchmark execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Empirical Benchmark Lab
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare theoretical Big-O complexity estimates with empirical runtime measurements across dynamic scales.
          </p>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-brand-50/60 border border-brand-200/60 rounded-lg p-4 flex items-center gap-3 text-xs text-brand-900">
        <ShieldCheck className="h-5 w-5 text-brand-600 shrink-0" />
        <div>
          <span className="font-semibold">Isolated Process Execution: </span>
          All benchmark runs are evaluated in separate, non-mainline subprocesses with strict AST module screening (no `os`, `sys`, `socket`) and hard per-step timeouts.
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Config Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <h3 className="font-bold text-sm text-slate-900 mb-3">
              1. Select Benchmark Algorithm
            </h3>
            <div className="space-y-2">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                    selectedSample?.id === s.id
                      ? "border-brand-600 bg-brand-50/40 font-semibold text-brand-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>{s.name}</span>
                  <ComplexityBadge notation={s.expected_complexity} />
                </button>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Input Scale Sequence (n)
                </label>
                <input
                  type="text"
                  value={inputSizes}
                  onChange={(e) => setInputSizes(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Input Type Generator
                </label>
                <select
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="array_int">Random Integer Array [1..10000]</option>
                  <option value="integer">Direct Integer Value (n)</option>
                  <option value="string">Character String Sequence ("x" * n)</option>
                </select>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleRunBenchmark}
                isLoading={isRunning}
                className="w-full mt-2"
              >
                <Play className="h-4 w-4 mr-1.5 fill-current" />
                <span>Execute Benchmark</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Plot & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Runtime Growth Curve (ms vs Input Size)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Observed wall-clock elapsed time across variable input magnitudes.
                </p>
              </div>
              {selectedSample && (
                <ComplexityBadge notation={selectedSample.expected_complexity} />
              )}
            </div>

            {results ? (
              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="input_size" tickLine={false} stroke="#94A3B8" fontSize={12} />
                    <YAxis tickLine={false} stroke="#94A3B8" fontSize={12} unit="ms" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: 8, border: "1px solid #E2E8F0" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="elapsed_time_ms"
                      name="Elapsed Time (ms)"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                <BarChart2 className="h-8 w-8 text-slate-300 mb-2" />
                <span>Run the benchmark to generate empirical scaling measurements.</span>
              </div>
            )}
          </Card>

          {/* Tabular Output */}
          {results && (
            <Card>
              <h4 className="font-bold text-sm text-slate-900 mb-3">
                Measurement Details
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-sans uppercase">
                      <th className="pb-2">Input Size (n)</th>
                      <th className="pb-2">Median Time (ms)</th>
                      <th className="pb-2">Peak Mem (KB)</th>
                      <th className="pb-2">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 font-bold text-slate-900">{r.input_size}</td>
                        <td className="py-2.5 text-brand-600 font-bold">{r.elapsed_time_ms} ms</td>
                        <td className="py-2.5 text-slate-600">{r.memory_peak_kb} KB</td>
                        <td className="py-2.5 text-slate-400">{r.variance.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
