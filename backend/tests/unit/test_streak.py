import sys
import unittest
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from models import UserStats
from services.streak import update_streak


class UpdateStreakTests(unittest.TestCase):
    def setUp(self):
        self.today = date.today()
        self.yesterday = self.today - timedelta(days=1)
        self.two_days_ago = self.today - timedelta(days=2)

    def test_starts_new_streak_when_never_journaled_before(self):
        stats = UserStats(streak_count=0, last_journaled_date=None)

        result = update_streak(stats)

        self.assertEqual(result, 1)
        self.assertEqual(stats.streak_count, 1)

    def test_increments_streak_when_last_entry_was_yesterday(self):
        stats = UserStats(streak_count=4, last_journaled_date=self.yesterday)

        result = update_streak(stats)

        self.assertEqual(result, 5)
        self.assertEqual(stats.streak_count, 5)

    def test_resets_streak_when_last_entry_was_before_yesterday(self):
        stats = UserStats(streak_count=7, last_journaled_date=self.two_days_ago)

        result = update_streak(stats)

        self.assertEqual(result, 1)
        self.assertEqual(stats.streak_count, 1)

    def test_keeps_streak_unchanged_when_already_journaled_today(self):
        stats = UserStats(streak_count=3, last_journaled_date=self.today)

        result = update_streak(stats)

        self.assertEqual(result, 3)
        self.assertEqual(stats.streak_count, 3)


if __name__ == "__main__":
    unittest.main()
