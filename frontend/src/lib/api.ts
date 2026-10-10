import axios from "axios";
import {
  AnalysisResponse,
  DashboardSummary,
  Project,
  BenchmarkSample,
  BenchmarkResult,
  CompareResponse,
  UserPreferences
} from "../types";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("codepulse_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Analysis
  analyzeCode: async (sourceCode: string, title = "Interactive Analysis", filename = "main.py"): Promise<AnalysisResponse> => {
    const res = await apiClient.post<AnalysisResponse>("/analysis/analyze", {
      source_code: sourceCode,
      title,
      filename,
      language: "python",
      include_ast: true,
      include_call_graph: true,
    });
    return res.data;
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get<DashboardSummary>("/analysis/dashboard");
    return res.data;
  },

  getRecentAnalyses: async (limit = 10) => {
    const res = await apiClient.get(`/analysis/recent?limit=${limit}`);
    return res.data;
  },

  getAnalysis: async (id: string): Promise<AnalysisResponse> => {
    const res = await apiClient.get<AnalysisResponse>(`/analysis/${id}`);
    return res.data;
  },

  deleteAnalysis: async (id: string) => {
    const res = await apiClient.delete(`/analysis/${id}`);
    return res.data;
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const res = await apiClient.get<Project[]>("/projects");
    return res.data;
  },

  createProject: async (name: string, description = "", language = "python"): Promise<Project> => {
    const res = await apiClient.post<Project>("/projects", { name, description, language });
    return res.data;
  },

  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    const res = await apiClient.put<Project>(`/projects/${id}`, data);
    return res.data;
  },

  deleteProject: async (id: string) => {
    const res = await apiClient.delete(`/projects/${id}`);
    return res.data;
  },

  // Benchmarks
  getBenchmarkSamples: async (): Promise<BenchmarkSample[]> => {
    const res = await apiClient.get<BenchmarkSample[]>("/benchmarks/samples");
    return res.data;
  },

  runBenchmark: async (codeSnippet: string, functionName = "solution", inputSizes: number[] = [100, 500, 1000], inputType = "array_int"): Promise<BenchmarkResult[]> => {
    const res = await apiClient.post<BenchmarkResult[]>("/benchmarks/run", {
      code_snippet: codeSnippet,
      function_name: functionName,
      input_sizes: inputSizes,
      input_type: inputType,
      iterations: 3,
    });
    return res.data;
  },

  // Comparisons
  compareCode: async (codeA: string, codeB: string): Promise<CompareResponse> => {
    const res = await apiClient.post<CompareResponse>("/compare", {
      code_a: codeA,
      code_b: codeB,
    });
    return res.data;
  },

  // Repositories
  uploadRepositoryZip: async (formData: FormData) => {
    const res = await apiClient.post("/repositories/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Settings
  getSettings: async (): Promise<UserPreferences> => {
    const res = await apiClient.get<UserPreferences>("/settings");
    return res.data;
  },

  updateSettings: async (settings: Partial<UserPreferences>): Promise<UserPreferences> => {
    const res = await apiClient.put<UserPreferences>("/settings", settings);
    return res.data;
  },

  // Reports
  getReportDownloadUrl: (analysisId: string, format: "pdf" | "json" | "csv") => {
    return `/api/reports/download/${analysisId}/${format}`;
  },
};
