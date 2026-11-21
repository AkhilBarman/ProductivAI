# ProductivAI — AI Agent Skill for Agensi.io

> **Personal productivity analysis, habit optimization, and daily schedule planning for AI agents.**

ProductivAI is an open-standard AI agent skill that transforms your AI assistant into an intelligent, realistic productivity coach. Rather than giving generic motivational advice, ProductivAI analyzes daily lifestyle patterns (sleep, deep work, movement, passive screens, social media, rest breaks, and mental energy), predicts your daily productivity score, identifies what's holding you back, and builds actionable daily routines.

---

## ⚡ What You Can Say to Your Agent

Once installed, your AI agent automatically recognizes requests like:

- *"Analyze how productive I was today."*
- *"I slept 6 hours, studied for 5 hours, went to the gym, but wasted too much time on Instagram. How was my day?"*
- *"I have college from 9 to 4 and exams in two weeks. Help me plan my day."*
- *"I can't focus today. What should I do?"*
- *"Help me create a realistic routine for tomorrow without burning myself out."*
- *"Review my productivity trends over the last week."*

---

## 📦 What's Inside the Skill Package

```text
agent-skill/
├── SKILL.md                          # Core Agent instructions and conversational workflows
├── README.md                         # Package overview and setup instructions
├── scripts/
│   └── evaluate_routine.py           # Standalone Python CLI engine (Dual-mode: Cloud API & Local Calculation)
├── references/
│   ├── scoring_rubric.md             # The 7 habits, mathematical weights, and category thresholds
│   ├── routine_archetypes.md         # Reference schedules for students, engineers, and exam crunch
│   └── troubleshooting_guide.md      # Root-cause diagnostic trees for procrastination and screen addiction
└── assets/
    └── report_template.md            # Clean markdown templates for daily and weekly reports
```

---

## 🔌 Compatibility & Installation

ProductivAI conforms to the **Agent Skills open specification** (`SKILL.md`) and connects seamlessly to any MCP-enabled or skill-supporting AI agent environment.

### 1. Agensi.io Marketplace Installation
1. Search for **ProductivAI** in the [Agensi.io](https://agensi.io) marketplace.
2. Click **Install to Agent**. Agensi's MCP server will dynamically load the skill into your connected agent environment.

### 2. Manual / Local Installation (Claude Code, Cursor, Codex, Gemini CLI)
Clone or copy the `agent-skill` folder into your agent's skills directory:

- **Claude Code**: Copy `agent-skill/` into your project root or `~/.claude/skills/productivai/`.
- **Cursor / Windsurf**: Add `agent-skill/SKILL.md` to your agent rules or documentation directory.
- **Antigravity**: Copy `agent-skill/` into your active project workspace.

---

## 🏗️ 3-Tier Architecture (Zero Hard Dependencies)

ProductivAI is designed to never fail even without internet access or API credentials:

1. **Tier 1 (Instant Conversational)**: The agent uses native reasoning and the provided `references/` guides to troubleshoot habits, build schedules, and diagnose focus issues with **zero external tools**.
2. **Tier 2 (Local Mathematical Engine)**: Using `scripts/evaluate_routine.py --offline`, the agent computes exact machine-learning weights locally with standard Python (no pip packages required).
3. **Tier 3 (Live Cloud ML Model)**: Connects to the live FastAPI backend (`https://productivai.onrender.com`) to evaluate predictions through the cloud Random Forest regressor and access historical logs.

---

## 🔒 Security, Privacy & Ethics

- **Zero Unnecessary Data**: Only extracts the 7 lifestyle metrics directly related to your routine evaluation.
- **No Involuntary Cloud Storage**: Local script and conversational analyses stay strictly between you and your AI agent.
- **Non-Clinical**: Does not diagnose ADHD, depression, or sleep disorders; focuses strictly on behavioral habit pacing.
- **Sustainable Output**: Rejects 14-hour grind culture in favor of science-backed sleep protection, Pomodoro cycles, and sustainable pacing.

---

## 📄 License
MIT License. Created by Akhil Barman.

