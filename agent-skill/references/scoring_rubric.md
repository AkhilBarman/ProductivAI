# ProductivAI Scoring Rubric & Metric Reference

This document provides AI agents with the exact behavioral definitions, bounds, coefficients, and conversational extraction guidelines for the 7 lifestyle metrics evaluated by ProductivAI.

---

## 1. The 7 Daily Routine Metrics

| Metric | Field Key | Default | Valid Range | Optimal Target | Definition & Guidance |
|---|---|---|---|---|---|
| **Sleep Hours** | `sleep_hours` | 7.0 | 2.0 – 12.0 | 7.0 – 9.0 hrs | Total actual sleep time (not just time lying in bed). Crucial for cognitive restoration, working memory, and prefrontal cortex function. |
| **Study / Work Hours** | `study_hours` | 4.0 | 0.0 – 14.0 | 4.0 – 8.0 hrs | Dedicated, active cognitive effort (study, coding, writing, problem solving). Excludes passive lecture attendance or idling at a desk. |
| **Physical Exercise** | `exercise_minutes` | 30.0 | 0 – 120 min | 30 – 60 min | Intentional movement (gym, brisk walk, jogging, cycling, yoga, sports). Promotes neuroplasticity, dopamine regulation, and reduces restlessness. |
| **Non-Work Screen Time** | `screen_time_hours` | 4.0 | 0.0 – 16.0 | $\le 4.0$ hrs | **Passive / recreational screen exposure** (gaming, YouTube binge, Netflix, mindless web browsing). *Does not include active study/work on a laptop.* |
| **Social Media Usage** | `social_media_hours` | 2.0 | 0.0 – 8.0 | $\le 1.5$ hrs | Short-form algorithmic feeds (Instagram, TikTok, Twitter/X, Reddit). High-frequency context switching that fragments attention span. |
| **Rest Breaks Taken** | `breaks_taken` | 3 | 0 – 10 breaks | 3 – 5 breaks | Intentional 5–15 minute pauses away from primary work screens to reset cognitive fatigue. |
| **Mood & Energy Level** | `mood_level` | 7 | 1 – 10 scale | 7 – 9 scale | Subjective rating of mental energy, enthusiasm, and emotional stability throughout the day. |

---

## 2. Conversational Extraction Guidelines

When conversing with a user, **never interrogate them with robotic variable names**. Parse their natural language using these cues:

### Extracting from Natural Language
- *"I slept around 6 and a half hours, then studied for about 4 hours..."*
  $\rightarrow$ `sleep_hours = 6.5`, `study_hours = 4.0`
- *"Went for a quick 20 min run, but ended up watching anime for 3 hours..."*
  $\rightarrow$ `exercise_minutes = 20.0`, `screen_time_hours = 3.0`
- *"Doomscrolled on Instagram for almost 2 hours before bed..."*
  $\rightarrow$ `social_media_hours = 2.0`
- *"Took two coffee breaks..."*
  $\rightarrow$ `breaks_taken = 2`
- *"Felt pretty drained and unmotivated..."*
  $\rightarrow$ `mood_level = 4`

### Handling Missing Information
If the user provides only 3–4 metrics:
1. Accept reasonable approximations without pedantic correction.
2. If an essential metric is omitted (e.g. sleep or study hours), ask a single concise follow-up question.
3. If the user does not know (e.g. "I didn't track my screen time"), assume the sensible baseline default (`4.0h` for screen, `2.0h` for social media, `3` breaks) and disclose the assumption transparently.

---

## 3. Mathematical Formula & Trained Coefficients

The machine learning regression model (Linear Regression trained on 50,000 lifestyle patterns) evaluates features strictly with the following equation:

$$\text{Raw Score} = 9.8647 + (2.9964 \cdot \text{sleep}) + (3.7577 \cdot \text{study}) + (0.1132 \cdot \text{exercise}) - (1.8756 \cdot \text{screen}) - (2.2562 \cdot \text{social}) + (1.1291 \cdot \text{breaks}) + (2.2478 \cdot \text{mood})$$

$$\text{Productivity Score} = \text{clip}(\text{round}(\text{Raw Score}), 0, 100)$$

### Weight Interpretation
- **Strongest Positive Driver**: Study / Work Hours ($+3.76$ points per hour).
- **Fundamental Anchor**: Sleep Duration ($+3.00$ points per hour).
- **Strongest Friction Factor**: Social Media Consumption ($-2.26$ points per hour).
- **Secondary Friction Factor**: Passive Screen Time ($-1.88$ points per hour).
- **Multiplier**: Mood & Energy ($+2.25$ points per level).

---

## 4. Score Classification & Plain-English Interpretation

| Score Tier | Category | Plain-English Interpretation | Guidance Tone |
|---|---|---|---|
| **75 – 100** | **High Productivity** | High cognitive stamina, strong habit alignment, disciplined focus with sufficient recovery. | Positive reinforcement; caution against over-exertion or ignoring rest. |
| **45 – 74** | **Moderate Productivity** | Functional output achieved, but performance is being diluted by 1–2 friction habits (e.g., elevated scrolling, irregular sleep, or scattered breaks). | Constructive and actionable; target the single biggest bottleneck. |
| **0 – 44** | **Low Productivity** | Routine is constrained by severe friction (sleep deprivation, high distraction, low study volume, or burnout). | Empathetic and non-judgmental; emphasize 1 immediate, low-friction micro-habit to restore momentum. |

> [!IMPORTANT]
> **Ethical Communication Rule**: Never present a productivity score as an objective rating of personal worth, moral discipline, or intelligence. It is strictly a relative metric reflecting habit alignment for a 24-hour cycle.

