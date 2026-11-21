# 🧠 ProductivAI — Personal Productivity Analyzer & AI Agent Skill

A full-stack, machine learning application and **Agensi.io AI Agent Skill** that predicts your daily **Productivity Score (0–100)**, explains habit drivers, and helps you optimize your daily routine through an interactive analytics dashboard and natural conversational AI workflows.

- **Live Frontend**: Deployed on Vercel
- **Live Backend API**: [https://productivai.onrender.com](https://productivai.onrender.com)
- **Agent Skill Standard**: Conforms to the open `SKILL.md` format (Agensi.io, Claude Code, Cursor, Codex, Gemini CLI)

---

## ⚡ What Makes ProductivAI Different

> **ProductivAI doesn't just tell you how productive you are. It helps you understand your habits, identify what is holding you back, and take practical steps to improve.**

ProductivAI operates in two complementary modes:
1. **Interactive Analytics Web App**: Dual-theme React 19 dashboard with presets, circular meters, factor donut charts, per-metric visualizers, and longitudinal history tracking.
2. **AI Agent Skill (`agent-skill/`)**: An installable capability package that allows your AI agent (Claude Code, Cursor, Codex, etc.) to analyze routines, build schedules, and troubleshoot procrastination directly in chat.

---

## 🤖 AI Agent Skill (Agensi.io Compatible)

ProductivAI is packaged as an open-standard AI agent skill in the `agent-skill/` directory.

### Natural Language Workflows
You don't need to visit the website or configure sliders. You can tell your AI assistant:
- *"Analyze how productive I was today: slept 6.5h, studied 4h, ran 20m, spent 3h scrolling."*
- *"I have college from 9 to 4 and exams in two weeks. Help me plan my day."*
- *"I waste 5 hours doomscrolling every day and can't focus. Help me fix this."*
- *"Help me create a realistic routine for tomorrow without burning myself out."*
- *"Review my productivity history and tell me what to improve this week."*

### 3-Tier Execution Hierarchy (Zero Hard Dependencies)
- **Tier 1 (Instant Conversational)**: The agent uses native reasoning and the provided `references/` guides to troubleshoot habits, build schedules, and diagnose focus issues with **zero external tools**.
- **Tier 2 (Local Mathematical Engine)**: Using `scripts/evaluate_routine.py --offline`, the agent computes exact machine-learning weights locally with standard Python (no pip packages required).
- **Tier 3 (Live Cloud ML Model)**: Connects to the live FastAPI backend (`https://productivai.onrender.com`) to evaluate predictions through the cloud Random Forest regressor and access historical logs.

---

## ✨ Application Features

- **ML-Powered Predictions** — Continuous productivity score (0–100) trained on 50,000 lifestyle records
- **AI Insights & Suggestions** — Qualitative positive drivers and concrete delta adjustment targets
- **Donut Score Breakdown** — Recharts donut chart visualizing positive drivers (Sleep, Study, Exercise, Mood) vs. friction (Screens, Social Media)
- **Quick Routine Presets** — 1-click test routines (Balanced, Deep Work, Exam Sprint, Rest & Recovery)
- **Longitudinal History & Trends (`/history`)** — SQLite session logging, multi-day area trendline chart, and 1-click "Load into Dashboard"
- **Per-Metric Visual Analytics (`/analysis`)** — Dedicated vertical bars, radial gauges, and pie proportions
- **Dark / Light Theme** — CSS variable token switching with persistent localStorage
- **High-Performance Code-Splitting** — Route-level lazy loading reducing initial bundle size to 234 kB

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   (Vite + TailwindCSS v4 + Framer Motion + Recharts)   │
│                                                        │
│   • DashboardPage (Inputs, Presets, Skeletons, Meters) │
│   • HistoryPage   (SQLite Logs, Area Trendlines, KPIs) │
│   • AnalysisPage  (Per-Metric Charts)                  │
│   • AboutPage     (System & Agent Skill Architecture)  │
└──────────────────────────┬─────────────────────────────┘
                           │
                 HTTP POST │ JSON Payload
             /predict & /history
                           │
┌──────────────────────────▼─────────────────────────────┐
│                   FastAPI Backend                      │
│                                                        │
│   • Pydantic Validation (PredictionInput schema)       │
│   • Heuristic Generators (insights, suggestions)       │
│   • Factor Contribution Breakdown (compute_breakdown)  │
│   • SQLite Persistence (database.py)                   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ In-Memory Model Prediction
┌──────────────────────────▼─────────────────────────────┐
│                 ML Inference Engine                    │
│                                                        │
│   • Serialized Model: productivity_model.pkl           │
│   • Architecture: Scikit-learn LinearRegression        │
│   • 7 Ordered Features -> Clipped Score [0, 100]       │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
ProductivAI/
├── agent-skill/
│   ├── SKILL.md                 # Agensi & Agent Skills standard specification
│   ├── README.md                # Marketplace documentation & installation guide
│   ├── scripts/
│   │   └── evaluate_routine.py  # Standalone CLI (Cloud API & offline local mode)
│   ├── references/
│   │   ├── scoring_rubric.md    # Metrics guide, coefficients & definitions
│   │   ├── routine_archetypes.md# Schedules for students, engineers, exam crunch
│   │   └── troubleshooting_guide.md # Diagnostic trees for focus & doomscrolling
│   └── assets/
│       └── report_template.md   # Daily and weekly markdown report templates
├── backend/
│   ├── main.py                  # FastAPI app (predict, history, insights)
│   ├── database.py              # Zero-dependency SQLite history logging
│   ├── model_training.py        # ML training pipeline
│   ├── requirements.txt         # Python dependencies
│   ├── dataset/
│   │   ├── generate_dataset.py  # Synthetic data generator
│   │   └── productivity_dataset.csv
│   └── models/
│       └── productivity_model.pkl # Trained Scikit-learn model artifact
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json              # SPA client-side route rewrites
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              # Layout, theme toggle, code-split routing
│       ├── index.css            # Dark/light theme tokens, range slider styles
│       ├── components/
│       │   ├── Sidebar.jsx      # Collapsible navigation drawer
│       │   ├── CircularProgress.jsx # Animated score ring
│       │   ├── InsightsPanel.jsx # AI insights cards
│       │   ├── SuggestionsPanel.jsx # Actionable advice cards
│       │   └── ScoreBreakdownChart.jsx # Donut chart
│       └── pages/
│           ├── DashboardPage.jsx # Sliders, presets, empty states, predictions
│           ├── HistoryPage.jsx   # SQLite session logs & area trendline
│           ├── AnalysisPage.jsx  # Metric visualizers
│           └── AboutPage.jsx     # System & skill documentation
├── AGENTS.md                    # Permanent development guide for AI agents
├── .gitignore
└── README.md
```

---

## 🚀 How to Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt

# Run backend API locally
uvicorn main:app --reload --port 8000
```
Backend runs at **http://localhost:8000**. Swagger docs at **http://localhost:8000/docs**.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**.

### Agent Skill CLI (Local Test)
```bash
# Live API evaluation
python agent-skill/scripts/evaluate_routine.py --sleep 7 --study 4 --exercise 30 --screen 4 --social 2 --breaks 3 --mood 7

# Offline calculation (zero network / zero dependencies)
python agent-skill/scripts/evaluate_routine.py --offline --sleep 8 --study 6
```

---

## 🔒 Security, Privacy & Ethics

- **No Medical Claims**: ProductivAI evaluates habit pacing and cognitive stamina; it does not diagnose medical or psychological conditions.
- **Privacy by Design**: Routine evaluation can be executed 100% locally through the conversation or CLI without cloud storage.
- **Sustainable Productivity**: Rejects 14-hour grind burnout culture in favor of science-backed sleep protection, active breaks, and focused deep-work blocks.

---

## 📄 License
MIT License. Created by Akhil Barman.
