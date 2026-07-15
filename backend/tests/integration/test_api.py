import json
import sys
import tempfile
import unittest
from contextlib import contextmanager
from datetime import date as Date
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import database as database_module
import main as main_module
from models import Goal, JournalEntry, PathMilestone, TraitScore, UserStats


@contextmanager
def use_temp_engine():
    with tempfile.TemporaryDirectory() as temp_dir:
        engine = create_engine(f"sqlite:///{temp_dir}/test.db", connect_args={"check_same_thread": False})

        original_database_engine = database_module.engine
        original_main_engine = main_module.engine
        database_module.engine = engine
        main_module.engine = engine

        SQLModel.metadata.create_all(engine)
        with Session(engine) as session:
            session.add(UserStats())
            for trait in [
                "stoicism",
                "resilience",
                "patience",
                "action_orientation",
                "critical_thinking",
            ]:
                session.add(TraitScore(trait=trait, score=0))
            session.commit()

        try:
            yield engine
        finally:
            database_module.engine = original_database_engine
            main_module.engine = original_main_engine


class ApiIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.engine_context = use_temp_engine()
        self.engine = self.engine_context.__enter__()
        self.client = TestClient(main_module.app)

    def tearDown(self):
        self.client.close()
        self.engine_context.__exit__(None, None, None)

    def _seed_goal(self, title: str, goal_type: str) -> Goal:
        with Session(self.engine) as session:
            goal = Goal(title=title, type=goal_type)
            session.add(goal)
            session.commit()
            session.refresh(goal)
            return goal

    def _seed_milestone(self, goal_id: int, label: str, order: int = 1) -> PathMilestone:
        with Session(self.engine) as session:
            milestone = PathMilestone(goal_id=goal_id, label=label, order=order)
            session.add(milestone)
            session.commit()
            session.refresh(milestone)
            return milestone

    def test_goals_crud_and_home_grouping(self):
        create_response = self.client.post("/goals", json={"title": "Run a 5K", "type": "short_term"})
        self.assertEqual(create_response.status_code, 201)
        short_goal = create_response.json()
        self.assertEqual(short_goal["title"], "Run a 5K")

        long_goal = self.client.post("/goals", json={"title": "Build a product", "type": "long_term"}).json()

        list_response = self.client.get("/goals")
        self.assertEqual(list_response.status_code, 200)
        grouped = list_response.json()
        self.assertEqual(len(grouped["short_term"]), 1)
        self.assertEqual(len(grouped["long_term"]), 1)

        update_response = self.client.patch(f"/goals/{short_goal['id']}", json={"title": "Run a 10K"})
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()["title"], "Run a 10K")

        milestone_goal = self._seed_goal("Read more", "short_term")
        self._seed_milestone(milestone_goal.id, "Read 10 pages", order=2)
        self._seed_milestone(long_goal["id"], "Ship a first draft", order=1)

        home_response = self.client.get("/home")
        self.assertEqual(home_response.status_code, 200)
        home = home_response.json()
        self.assertGreaterEqual(len(home["short_term_milestones"]), 1)
        self.assertGreaterEqual(len(home["long_term_milestones"]), 1)

        delete_response = self.client.delete(f"/goals/{long_goal['id']}")
        self.assertEqual(delete_response.status_code, 204)

        with Session(self.engine) as session:
            deleted_goal = session.get(Goal, long_goal["id"])
            deleted_milestones = session.exec(select(PathMilestone).where(PathMilestone.goal_id == long_goal["id"])).all()
        self.assertIsNone(deleted_goal)
        self.assertEqual(deleted_milestones, [])

    def test_journal_lifecycle_updates_stats_and_traits(self):
        goals = [
            self._seed_goal("Run a 5K", "short_term"),
            self._seed_goal("Build a product", "long_term"),
        ]

        opening_response = SimpleNamespace(content=[SimpleNamespace(text="How are you feeling today?")])
        reply_response = SimpleNamespace(content=[SimpleNamespace(text="Tell me more about that.")])
        analysis_payload = {
            "xp_awarded": 15,
            "strengths": "You reflected clearly.",
            "areas_to_improve": "You could slow down and notice patterns.",
            "suggestions": "Write one concrete action for tomorrow.",
            "trait_deltas": {
                "stoicism": 1,
                "resilience": 2,
                "patience": 0,
                "action_orientation": 2,
                "critical_thinking": 1,
            },
            "goal_connections": "You connected the entry to your goals.",
            "path_milestones": [
                {"goal_id": goals[0].id, "label": "Run 10 minutes", "order": 1},
                {"goal_id": goals[1].id, "label": "Define scope", "order": 2},
            ],
        }
        analysis_response = SimpleNamespace(
            content=[SimpleNamespace(text="```json\n" + json.dumps(analysis_payload) + "\n```")]
        )

        with patch("services.claude.get_opening_message", return_value=opening_response.content[0].text), patch(
            "services.claude.send_message", return_value=reply_response.content[0].text
        ), patch("services.claude.analyze_entry", return_value=analysis_payload):
            today_response = self.client.get("/journal/today")
            self.assertEqual(today_response.status_code, 200)
            self.assertEqual(today_response.json()["status"], "active")

            message_response = self.client.post("/journal/message", json={"content": "I had a productive day."})
            self.assertEqual(message_response.status_code, 200)
            self.assertEqual(message_response.json()["content"], reply_response.content[0].text)

            complete_response = self.client.post("/journal/complete")
            self.assertEqual(complete_response.status_code, 200)
            debrief = complete_response.json()
            self.assertEqual(debrief["xp_awarded"], 15)
            self.assertEqual(debrief["streak_count"], 1)
            self.assertEqual(debrief["path_milestones"], analysis_payload["path_milestones"])
            self.assertEqual(debrief["weekly_streak"][Date.today().weekday()], True)

        with Session(self.engine) as session:
            stats = session.exec(select(UserStats)).first()
            traits = {row.trait: row.score for row in session.exec(select(TraitScore)).all()}
            entry = session.exec(select(JournalEntry)).first()

        self.assertEqual(stats.xp_total, 15)
        self.assertEqual(stats.streak_count, 1)
        self.assertEqual(entry.completed, True)
        self.assertEqual(traits["resilience"], 2)
        self.assertEqual(traits["action_orientation"], 2)
        self.assertEqual(traits["critical_thinking"], 1)


if __name__ == "__main__":
    unittest.main()