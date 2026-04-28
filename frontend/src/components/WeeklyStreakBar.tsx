const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface WeeklyStreakBarProps {
  weekly_streak: boolean[]
  streak_count: number
}

export function WeeklyStreakBar({ weekly_streak, streak_count }: WeeklyStreakBarProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        {DAYS.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                weekly_streak[i]
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}
            >
              {day}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm font-bold text-orange-500">{streak_count} day streak 🔥</p>
    </div>
  )
}
