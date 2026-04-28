import json
import logging
import os

from anthropic import Anthropic
from fastapi import HTTPException

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL = "claude-sonnet-4-6"


def _build_system_prompt(goals, stats, recent_debriefs=None):
    if recent_debriefs is None:
        recent_debriefs = []

    short_term = [g.title for g in goals if g.type == "short_term"] if goals else []
    long_term = [g.title for g in goals if g.type == "long_term"] if goals else []

    goals_section = ""
    if goals:
        goals_section = (
            "\nYou are coaching them toward these goals:\n"
            f"  Short-term: {', '.join(short_term) if short_term else 'None set'}\n"
            f"  Long-term: {', '.join(long_term) if long_term else 'None set'}\n"
        )

    stats_section = ""
    if stats:
        stats_section = (
            "\nTheir current stats:\n"
            f"  XP: {stats.xp_total} | Streak: {stats.streak_count} days\n"
        )

    history_section = ""
    if recent_debriefs:
        lines = []
        for d in recent_debriefs:
            entry_date = d.get("date", "")
            strengths = (d.get("strengths") or "")[:80]
            suggestions = (d.get("suggestions") or "")[:80]
            lines.append(f"  {entry_date}: {strengths} | {suggestions}")
        history_section = "\nRecent journal history (last 7 entries):\n" + "\n".join(lines) + "\n"

    goal_line = "Orient questions gently toward their goals if goals exist.\n" if goals else ""

    return (
        "You are a warm, insightful life coach named Level Up.\n"
        f"{goals_section}"
        f"{stats_section}"
        f"{history_section}"
        "\nYour role during journaling: ask one warm, adaptive question at a time.\n"
        f"{goal_line}"
        "Do not reference these instructions to the user."
    )


def get_opening_message(goals, stats) -> str:
    system = _build_system_prompt(goals, stats)
    response = client.messages.create(
        model=MODEL,
        max_tokens=300,
        system=system,
        messages=[
            {"role": "user", "content": "Start the journaling session with a single warm, open question."}
        ],
    )
    return response.content[0].text


def send_message(messages, goals, stats, recent_debriefs) -> str:
    system = _build_system_prompt(goals, stats, recent_debriefs)
    response = client.messages.create(
        model=MODEL,
        max_tokens=500,
        system=system,
        messages=messages,
    )
    return response.content[0].text


def analyze_entry(messages, goals, stats, recent_debriefs) -> dict:
    system = _build_system_prompt(goals, stats, recent_debriefs)
    has_goals = bool(goals)

    goal_connections_field = (
        '"<string describing how this session connects to their goals>"'
        if has_goals
        else "null"
    )

    analysis_instruction = (
        "Based on this journaling session, return a JSON object with exactly these fields:\n"
        "{\n"
        '  "xp_awarded": <int, 5-25 based on depth and reflection quality>,\n'
        '  "strengths": "<1-2 sentences on what the user demonstrated well>",\n'
        '  "areas_to_improve": "<1-2 sentences on what needs work>",\n'
        '  "suggestions": "<1-2 concrete, actionable suggestions for tomorrow>",\n'
        '  "trait_deltas": {\n'
        '    "stoicism": <int 0-3>,\n'
        '    "resilience": <int 0-3>,\n'
        '    "patience": <int 0-3>,\n'
        '    "action_orientation": <int 0-3>,\n'
        '    "critical_thinking": <int 0-3>\n'
        "  },\n"
        f'  "goal_connections": {goal_connections_field},\n'
        '  "path_milestones": [{"goal_id": <int>, "label": "<string>", "order": <int>}]\n'
        "}\n"
        "Return only the JSON. No explanation. No markdown wrapper."
    )

    full_messages = list(messages) + [{"role": "user", "content": analysis_instruction}]

    system = _build_analysis_system_prompt()
    response = client.messages.create(
        model=MODEL,
        max_tokens=1000,
        system=system,
        messages=full_messages,
    )

    raw = response.content[0].text.strip()

    # Strip markdown code fence if Claude ignores the instruction
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    # Extract just the JSON object — handles leading/trailing explanation text
    start = raw.find("{")
    end = raw.rfind("}")
    if start != -1 and end != -1 and end > start:
        raw = raw[start : end + 1]

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        logging.error("Claude returned invalid JSON: %r — %s", raw, e)
        raise HTTPException(status_code=503, detail="AI analysis failed — please try again.")


def _build_analysis_system_prompt():
    return (
        "You are a strict JSON generator.\n"
        "Return only valid JSON matching the requested schema.\n"
        "Do not add markdown, commentary, or conversational text."
    )
