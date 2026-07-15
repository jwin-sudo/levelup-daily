import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from pydantic import ValidationError

from schemas import CreateGoalRequest, DebriefResponse, MessageResponse, StatsResponse


class SchemaTests(unittest.TestCase):
    def test_create_goal_request_accepts_allowed_goal_types(self):
        goal = CreateGoalRequest(title="Run a 5K", type="short_term")

        self.assertEqual(goal.title, "Run a 5K")
        self.assertEqual(goal.type, "short_term")

    def test_create_goal_request_rejects_invalid_goal_type(self):
        with self.assertRaises(ValidationError):
            CreateGoalRequest(title="Run a 5K", type="monthly")

    def test_message_response_serializes_expected_fields(self):
        response = MessageResponse(role="assistant", content="Keep going.")

        self.assertEqual(response.model_dump(), {"role": "assistant", "content": "Keep going."})

    def test_stats_response_keeps_trait_score_mapping(self):
        stats = StatsResponse(
            xp_total=42,
            streak_count=3,
            trait_scores={
                "stoicism": 1,
                "resilience": 2,
                "patience": 0,
                "action_orientation": 4,
                "critical_thinking": 2,
            },
        )

        self.assertEqual(stats.trait_scores["action_orientation"], 4)
        self.assertEqual(stats.xp_total, 42)

    def test_debrief_response_allows_optional_goal_connections(self):
        debrief = DebriefResponse(
            xp_awarded=10,
            strengths="You were reflective.",
            areas_to_improve="Try to pause before reacting.",
            suggestions="Write one more paragraph tomorrow.",
            trait_deltas={
                "stoicism": 1,
                "resilience": 1,
                "patience": 0,
                "action_orientation": 2,
                "critical_thinking": 1,
            },
            goal_connections=None,
            path_milestones=[],
            streak_count=2,
            weekly_streak=[False, True, False, False, False, False, False],
        )

        self.assertIsNone(debrief.goal_connections)
        self.assertEqual(debrief.xp_awarded, 10)


if __name__ == "__main__":
    unittest.main()
