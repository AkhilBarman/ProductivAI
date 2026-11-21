"""
SQLite database module for historical productivity session logging.
Uses Python's standard library sqlite3 (zero external dependencies).
"""

import os
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any

DB_DIR = os.path.join(os.path.dirname(__file__), "database")
DB_PATH = os.path.join(DB_DIR, "productivity_history.db")


def get_db_connection():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create the history table if it does not already exist."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS productivity_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    sleep_hours REAL NOT NULL,
                    study_hours REAL NOT NULL,
                    exercise_minutes REAL NOT NULL,
                    screen_time_hours REAL NOT NULL,
                    social_media_hours REAL NOT NULL,
                    breaks_taken INTEGER NOT NULL,
                    mood_level INTEGER NOT NULL,
                    productivity_score INTEGER NOT NULL,
                    category TEXT NOT NULL,
                    score_breakdown TEXT NOT NULL
                )
                """
            )
    finally:
        conn.close()


def insert_record(data: dict, score: int, category: str, breakdown: dict) -> int:
    """Insert a new prediction record into history."""
    conn = get_db_connection()
    try:
        now_iso = datetime.now().strftime("%b %d, %Y • %I:%M %p")
        with conn:
            cursor = conn.execute(
                """
                INSERT INTO productivity_history (
                    timestamp, sleep_hours, study_hours, exercise_minutes,
                    screen_time_hours, social_media_hours, breaks_taken,
                    mood_level, productivity_score, category, score_breakdown
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    now_iso,
                    float(data.get("sleep_hours", 0)),
                    float(data.get("study_hours", 0)),
                    float(data.get("exercise_minutes", 0)),
                    float(data.get("screen_time_hours", 0)),
                    float(data.get("social_media_hours", 0)),
                    int(data.get("breaks_taken", 0)),
                    int(data.get("mood_level", 0)),
                    int(score),
                    category,
                    json.dumps(breakdown),
                ),
            )
            return cursor.lastrowid
    finally:
        conn.close()


def fetch_all_records(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve history records ordered from most recent to oldest."""
    conn = get_db_connection()
    try:
        cursor = conn.execute(
            """
            SELECT * FROM productivity_history
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cursor.fetchall()
        records = []
        for r in rows:
            record = dict(r)
            try:
                record["score_breakdown"] = json.loads(record["score_breakdown"])
            except Exception:
                record["score_breakdown"] = {}
            records.append(record)
        return records
    finally:
        conn.close()


def compute_stats() -> Dict[str, Any]:
    """Calculate aggregate metrics across all historical sessions."""
    conn = get_db_connection()
    try:
        cursor = conn.execute("SELECT productivity_score, category FROM productivity_history")
        rows = cursor.fetchall()
        if not rows:
            return {
                "total_records": 0,
                "average_score": 0,
                "highest_score": 0,
                "lowest_score": 0,
                "high_count": 0,
                "moderate_count": 0,
                "low_count": 0,
                "high_rate": 0,
            }
        scores = [r["productivity_score"] for r in rows]
        categories = [r["category"] for r in rows]
        high_count = categories.count("High Productivity")
        return {
            "total_records": len(scores),
            "average_score": round(sum(scores) / len(scores), 1),
            "highest_score": max(scores),
            "lowest_score": min(scores),
            "high_count": high_count,
            "moderate_count": categories.count("Moderate Productivity"),
            "low_count": categories.count("Low Productivity"),
            "high_rate": round((high_count / len(scores)) * 100),
        }
    finally:
        conn.close()


def delete_all_records() -> bool:
    """Clear all records from the history table."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("DELETE FROM productivity_history")
        return True
    finally:
        conn.close()

