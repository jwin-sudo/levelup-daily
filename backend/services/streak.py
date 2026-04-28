from datetime import date, timedelta

from models import UserStats


def update_streak(stats: UserStats) -> int:
    today = date.today()
    yesterday = today - timedelta(days=1)

    last = stats.last_journaled_date

    if last is None or last < yesterday:
        stats.streak_count = 1
    elif last == yesterday:
        stats.streak_count += 1
    # last == today: no change, already counted today

    return stats.streak_count
