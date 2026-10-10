# CodePulse ? Intelligent Code Complexity Analyzer & Performance Intelligence Platform

[![Backend Tests](https://img.shields.io/badge/pytest-13%20passed-success?logo=pytest)](https://github.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.143-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)

CodePulse is a full-stack, developer-first static analysis platform that inspects Python source code, estimates asymptotic algorithmic complexity (Big-O time and space), measures McCabe cyclomatic complexity and Halstead maintainability indices, detects structural anti-patterns, and renders interactive Abstract Syntax Trees (AST) and function call graphs.

Designed with **Linear-style clarity**, CodePulse provides transparent, evidence-based code intelligence suitable for software engineering portfolios, technical interviews, and automated architectural audits.

---

## ? Core Capabilities

- **Algorithmic Complexity Estimation**: Identifies asymptotic growth patterns ($O(1)$, $O(\log n)$, $O(n)$, $O(n \log n)$, $O(n^2)$, $O(2^n)$) based on AST loop nesting, branch steps, and recursion structures, with explicit assumptions, structural evidence, and confidence ratings.
- **McCabe Cyclomatic Complexity**: Deterministically computes branch decision points across conditionals, loops, boolean operators, comprehensions, and exception blocks, assigning ranks A through F.
- **Maintainability Index & Halstead Metrics**: Calculates Halstead volume, difficulty, effort, estimated bugs, and SEI normalized Maintainability Index ($0?100$).
- **Rule-Based Code Smell Detection**: Detects deeply nested control flow, long functions, high parameter counts, mutable default arguments, bare except blocks, and quadratic string concatenation loops.
- **Interactive Visualizers**: Renders zoomable, draggable Abstract Syntax Trees and function call dependency graphs powered by React Flow.
- **Empirical Benchmark Lab**: Measures real-world execution times and peak memory profiles across scaled synthetic inputs ($100$ to $50,000$ items) in isolated execution sandboxes.
- **Side-by-Side Comparison Center**: Evaluates two code candidate versions, calculating quantitative diffs in complexity, maintainability, and resolved vs. newly introduced smells.
- **Publication-Ready Reports**: Generates formal audit reports downloadable in PDF, JSON, and CSV.

---

## ??? Architecture & Technology Stack

```
codepulse/
??? backend/
?   ??? app/
?   ?   ??? analysis/       # AST Parser, Complexity Estimator, Radon metrics, Call Graph, Smells
?   ?   ??? api/            # FastAPI REST routes (health, analysis, projects, benchmarks, reports)
?   ?   ??? core/           # Configuration & environment settings
?   ?   ??? db/             # SQLAlchemy engine & SQLite / Postgres session factory
?   ?   ??? models/         # Database models (User, Project, AnalysisRun, FunctionMetric, Finding)
?   ?   ??? schemas/        # Pydantic v2 request & response contracts
?   ?   ??? security/       # Password hashing & JWT token security
?   ?   ??? services/       # Analysis persistence, benchmark runner, project lifecycle
?   ?   ??? tests/          # Pytest suite (analysis unit tests & API integration tests)
?   ??? pyproject.toml      # Python dependencies managed via uv
??? frontend/
?   ??? src/
?   ?   ??? components/     # AppLayout, Sidebar, Header, AST & CallGraph viewers, UI primitives
?   ?   ??? pages/          # All 11 application routes
?   ?   ??? lib/            # Axios API client & utility helpers
?   ?   ??? types/          # Full TypeScript domain contracts
?   ??? package.json        # React 18, Vite, Tailwind CSS, Monaco Editor, Recharts, React Flow
??? docker-compose.yml      # Containerized multi-service deployment
```

---

## ?? Quickstart & Local Development

### Prerequisites
- Python 3.11+ (or `uv` package manager)
- Node.js 18+ and npm

### 1. Launch Backend API

```powershell
cd C:\Users\Admin\codepulse\backend

# Using uv (recommended)
uv run uvicorn app.main:app --reload --port 8000
```

The FastAPI backend will start on `http://localhost:8000`. Database tables and initial sample data are seeded automatically on first startup. Interactive Swagger documentation is available at `http://localhost:8000/docs`.

### 2. Launch Frontend Studio

```powershell
cd C:\Users\Admin\codepulse\frontend

# Start Vite dev server
npm run dev
```

The frontend application will open on `http://localhost:5173`.

---

## ?? Automated Test Suite

Run the complete backend test suite (covering unit tests for complexity patterns and integration tests for all API endpoints):

```powershell
cd C:\Users\Admin\codepulse\backend
uv run python -m pytest app/tests/ -v
```

All 13 tests pass with full assertions:
- `test_constant_time_analysis` ($O(1)$)
- `test_linear_loop_analysis` ($O(n)$)
- `test_nested_loops_quadratic` ($O(n^2)$)
- `test_logarithmic_step_loop` ($O(\log n)$)
- `test_exponential_recursion` ($O(2^n)$)
- `test_sorting_operation` ($O(n \log n)$)
- `test_syntax_error_graceful_handling`
- `test_health_endpoint`
- `test_analyze_endpoint`
- `test_projects_crud`
- `test_benchmarks_samples_and_run`
- `test_compare_endpoint`
- `test_reports_export` (PDF, JSON, CSV)

To verify frontend TypeScript compilation and build:

```powershell
cd C:\Users\Admin\codepulse\frontend
npm run build
```

---

## ?? Application Routes

| Path | Description | Key Features |
|---|---|---|
| `/` | Landing Page | Feature overview, live interactive demo, methodology |
| `/dashboard` | Analytics Dashboard | Summary metrics, complexity distribution, maintainability trends, recent runs |
| `/analyze` | Code Analysis Workspace | Monaco editor, sample algorithms, AST/Call graph visuals, smell alerts |
| `/projects` | Projects & History | Persistent projects, search/filter, rename, delete confirmation |
| `/repositories` | Repository Scanner | ZIP archive upload, multi-file metrics, ranked complex routines |
| `/benchmarks` | Complexity Lab | Empirical execution scaling, input size vs runtime line plots, sandbox security |
| `/compare` | Side-by-Side Comparison | Compare two versions, quantitative delta table, resolved anti-patterns |
| `/reports` | Audit Reports | Formal exports in PDF, JSON, and CSV |
| `/settings` | User Preferences | Editor font, tab width, cyclomatic warning thresholds, system info |
| `/docs` | Documentation | McCabe formula, Halstead software science, Big-O reference |
| `/login` & `/register` | Authentication | Developer session sign-in, account creation |

---

## ??? Engineering Honesty & Scientific Limitations

- **Heuristic vs Deterministic:** Line counts, McCabe cyclomatic scores, and Halstead calculations are mathematically deterministic. Algorithmic asymptotic complexity ($O$) is estimated using static structural heuristics; Alan Turing's Halting Problem proves that general program behavior is undecidable statically.
- **Uncertainty Disclosure:** CodePulse never asserts an estimated complexity as a proven mathematical theorem. If dynamic conditions (e.g. data-dependent early exits) prevent clear classification, results are explicitly marked with documented confidence tiers.
- **Isolated Execution:** User-submitted benchmark code is never executed inside the main web server process. Execution runs within an isolated subprocess with strict AST safety filters and timeouts.

---

## ?? License

MIT License. Developed for software engineering excellence, algorithmic transparency, and portfolio demonstration.
