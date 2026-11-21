#!/usr/bin/env python3
"""
ProductivAI — Standalone Routine Evaluation Engine
Zero-dependency Python CLI tool supporting both live API inference and local mathematical computation.

Usage:
    python evaluate_routine.py --sleep 7 --study 4 --exercise 30 --screen 4 --social 2 --breaks 3 --mood 7
    python evaluate_routine.py --json '{"sleep_hours": 7, "study_hours": 4, "exercise_minutes": 30, "screen_time_hours": 4, "social_media_hours": 2, "breaks_taken": 3, "mood_level": 7}'
    python evaluate_routine.py --offline --sleep 8 --study 6
"""

import sys
import json
import argparse
import urllib.request
import urllib.error

# Exact Scikit-learn Linear Regression model parameters trained on 50,000 synthetic records
MODEL_INTERCEPT = 9.864696401476351
MODEL_COEFFICIENTS = {
    "sleep_hours": 2.99640037,
    "study_hours": 3.75768942,
    "exercise_minutes": 0.11315387,
    "screen_time_hours": -1.87558823,
    "social_media_hours": -2.25622348,
    "breaks_taken": 1.1291148,
    "mood_level": 2.24778748,
}

DEFAULT_ROUTINE = {
    "sleep_hours": 7.0,
    "study_hours": 4.0,
    "exercise_minutes": 30.0,
    "screen_time_hours": 4.0,
    "social_media_hours": 2.0,
    "breaks_taken": 3,
    "mood_level": 7,
}


def local_predict(routine: dict) -> dict:
    """Compute productivity score, insights, and breakdown locally using exact model weights."""
    sleep = float(routine.get("sleep_hours", 7.0))
    study = float(routine.get("study_hours", 4.0))
    exercise = float(routine.get("exercise_minutes", 30.0))
    screen = float(routine.get("screen_time_hours", 4.0))
    social = float(routine.get("social_media_hours", 2.0))
    breaks = int(routine.get("breaks_taken", 3))
    mood = int(routine.get("mood_level", 7))

    # Linear regression formula evaluated against trained weights
    raw_score = (
        MODEL_INTERCEPT
        + MODEL_COEFFICIENTS["sleep_hours"] * sleep
        + MODEL_COEFFICIENTS["study_hours"] * study
        + MODEL_COEFFICIENTS["exercise_minutes"] * exercise
        + MODEL_COEFFICIENTS["screen_time_hours"] * screen
        + MODEL_COEFFICIENTS["social_media_hours"] * social
        + MODEL_COEFFICIENTS["breaks_taken"] * breaks
        + MODEL_COEFFICIENTS["mood_level"] * mood
    )

    score = int(max(0, min(100, round(raw_score))))

    if score >= 75:
        category = "High Productivity"
    elif score >= 45:
        category = "Moderate Productivity"
    else:
        category = "Low Productivity"

    # Contextual qualitative insights
    insights = []
    if sleep >= 7:
        insights.append("Sufficient sleep (7h+) is sustaining your cognitive baseline.")
    elif sleep < 5.5:
        insights.append("Sleep deficit is significantly lowering cognitive stamina and focus capacity.")

    if study >= 6:
        insights.append("High study volume is your primary positive output driver.")
    elif study < 2.5:
        insights.append("Low active study/work hours are capping daily productivity potential.")

    if exercise >= 30:
        insights.append("Physical activity is supporting dopamine and mental clarity.")
    elif exercise == 0:
        insights.append("Absence of movement may contribute to afternoon fatigue and restlessness.")

    if screen > 6:
        insights.append("Elevated non-productive screen time is creating digital fatigue.")
    if social > 2.5:
        insights.append("Social media usage is fragmenting attention and increasing context switching.")
    if breaks >= 3:
        insights.append("Structured rest pauses are helping prevent burnout.")
    elif breaks <= 1:
        insights.append("Insufficient breaks increase risk of diminished afternoon returns.")

    if mood >= 8:
        insights.append("Positive mental outlook is boosting motivation and execution speed.")
    elif mood <= 4:
        insights.append("Low energy or emotional mood is directly dragging on task initiation.")

    # Actionable suggestions
    suggestions = []
    if sleep < 7:
        suggestions.append(f"Target 7.5h sleep tonight (currently {sleep}h) to restore working memory.")
    if study < 3:
        suggestions.append("Block out at least two dedicated 60-minute deep work sessions.")
    if exercise < 30:
        suggestions.append(f"Add a 15–20 minute brisk walk to activate physical energy.")
    if screen > 5:
        suggestions.append(f"Cap passive screen consumption by {round(screen - 4, 1)}h using app limiters.")
    if social > 1.5:
        suggestions.append(f"Reduce social media by {round(social - 1, 1)}h, especially during the first hour after waking.")
    if breaks < 3:
        suggestions.append("Adopt a 50/10 focus cycle (50m deep work, 10m off-screen recovery).")
    if mood < 6:
        suggestions.append("Engage in a low-stimulation recharge activity (fresh air, hydration, stretching).")

    if not suggestions and score >= 80:
        suggestions.append("Routine is in an optimal zone. Maintain current pacing to avoid over-exertion.")

    # Factor contribution breakdown
    breakdown = {
        "sleep": min(int((sleep / 9) * 25), 25),
        "study": min(int((study / 10) * 35), 35),
        "exercise": min(int((exercise / 90) * 15), 15),
        "screen_time": -min(int((screen / 16) * 15), 15),
        "social_media": -min(int((social / 8) * 10), 10),
        "mood": min(int((mood / 10) * 20), 20),
    }

    return {
        "productivity_score": score,
        "category": category,
        "insights": insights,
        "suggestions": suggestions,
        "score_breakdown": breakdown,
        "engine": "local_trained_linear_weights",
    }


def remote_predict(routine: dict, api_url: str) -> dict:
    """Send prediction request to live ProductivAI backend API."""
    url = f"{api_url.rstrip('/')}/predict"
    payload = json.dumps(routine).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=5) as response:
        data = json.loads(response.read().decode("utf-8"))
        data["engine"] = "live_cloud_api"
        return data


def main():
    parser = argparse.ArgumentParser(description="Evaluate daily productivity metrics with ProductivAI.")
    parser.add_argument("--sleep", type=float, default=None, help="Sleep duration in hours (2-12)")
    parser.add_argument("--study", type=float, default=None, help="Active study/work in hours (0-14)")
    parser.add_argument("--exercise", type=float, default=None, help="Exercise in minutes (0-120)")
    parser.add_argument("--screen", type=float, default=None, help="Non-work screen time in hours (0-16)")
    parser.add_argument("--social", type=float, default=None, help="Social media scrolling in hours (0-8)")
    parser.add_argument("--breaks", type=int, default=None, help="Meaningful breaks taken (0-10)")
    parser.add_argument("--mood", type=int, default=None, help="Subjective mood/energy rating (1-10)")
    parser.add_argument("--json", type=str, default=None, help="JSON string with routine metrics")
    parser.add_argument("--api-url", type=str, default="https://productivai.onrender.com", help="ProductivAI API endpoint")
    parser.add_argument("--offline", action="store_true", help="Force local computation without network API")
    parser.add_argument("--format", choices=["json", "text"], default="json", help="Output format")

    args = parser.parse_args()

    # Assemble routine inputs
    routine = dict(DEFAULT_ROUTINE)

    if args.json:
        try:
            parsed = json.loads(args.json)
            routine.update(parsed)
        except Exception as e:
            sys.stderr.write(f"Error parsing --json argument: {e}\n")
            sys.exit(1)

    if args.sleep is not None: routine["sleep_hours"] = args.sleep
    if args.study is not None: routine["study_hours"] = args.study
    if args.exercise is not None: routine["exercise_minutes"] = args.exercise
    if args.screen is not None: routine["screen_time_hours"] = args.screen
    if args.social is not None: routine["social_media_hours"] = args.social
    if args.breaks is not None: routine["breaks_taken"] = args.breaks
    if args.mood is not None: routine["mood_level"] = args.mood

    # Attempt live API inference unless offline is requested
    result = None
    if not args.offline and args.api_url:
        try:
            result = remote_predict(routine, args.api_url)
        except (urllib.error.URLError, TimeoutError, Exception) as e:
            sys.stderr.write(f"[Notice] Cloud API unavailable ({e}). Gracefully falling back to local model.\n")
            result = None

    # Fallback to local computation
    if result is None:
        result = local_predict(routine)

    # Output results
    if args.format == "json":
        print(json.dumps(result, indent=2))
    else:
        print(f"\nProductivity Score: {result['productivity_score']}/100 ({result['category']})")
        print(f"Engine: {result.get('engine')}")
        print("\nInsights:")
        for ins in result["insights"]:
            print(f"  • {ins}")
        print("\nSuggestions:")
        for sug in result["suggestions"]:
            print(f"  → {sug}")
        print("\nScore Breakdown:")
        for k, v in result["score_breakdown"].items():
            print(f"  - {k}: {v:+}%")


if __name__ == "__main__":
    main()

