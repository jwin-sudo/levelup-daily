import json
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from models import Goal, UserStats
from services import claude


class ClaudeServiceTests(unittest.TestCase):
    def test_build_system_prompt_includes_goals_and_stats(self):
        goals = [
            Goal(title="Run a 5K", type="short_term"),
            Goal(title="Build a product", type="long_term"),
        ]
        stats = UserStats(xp_total=120, streak_count=5)

        prompt = claude._build_system_prompt(goals, stats, [])

        self.assertIn("Run a 5K", prompt)
        self.assertIn("Build a product", prompt)
        self.assertIn("XP: 120", prompt)
        self.assertIn("Streak: 5 days", prompt)

    def test_analyze_entry_parses_json_from_claude_response(self):
        payload = {
            "xp_awarded": 12,
            "strengths": "You showed honesty and self-awareness.",
            "areas_to_improve": "You could slow down before reacting.",
            "suggestions": "Try writing one concrete next step tomorrow.",
            "trait_deltas": {
                "stoicism": 1,
                "resilience": 2,
                "patience": 0,
                "action_orientation": 1,
                "critical_thinking": 1,
            },
            "goal_connections": None,
            "path_milestones": [],
        }

        fake_response = SimpleNamespace(
            content=[SimpleNamespace(text="Here is the analysis:\n```json\n" + json.dumps(payload) + "\n```")]
        )

        with patch.object(claude.client.messages, "create", return_value=fake_response):
            result = claude.analyze_entry(
                messages=[{"role": "user", "content": "I had a productive day."}],
                goals=[],
                stats=UserStats(xp_total=0, streak_count=0),
                recent_debriefs=[],
            )

        self.assertEqual(result, payload)


if __name__ == "__main__":
    unittest.main()
