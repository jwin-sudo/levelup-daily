import { WeeklyStreakBar } from './WeeklyStreakBar'
import type { DebriefResponse } from '../types'

interface DebriefScreenProps {
  debrief: DebriefResponse
}

export function DebriefScreen({ debrief }: DebriefScreenProps) {
  return (
    <div className="px-4 pt-4 pb-8 flex flex-col gap-4">
      <div className="bg-green-50 border border-green-200 rounded-2xl py-5 px-6 flex flex-col items-center gap-4">
        <span className="text-5xl font-black text-green-500 tracking-tight">+{debrief.xp_awarded} XP</span>
        <WeeklyStreakBar weekly_streak={debrief.weekly_streak} streak_count={debrief.streak_count} />
      </div>

      <FeedbackCard emoji="💪" title="Strengths" content={debrief.strengths} colorClass="bg-blue-50 border-blue-100" />
      <FeedbackCard emoji="🎯" title="Areas to Improve" content={debrief.areas_to_improve} colorClass="bg-yellow-50 border-yellow-100" />
      <FeedbackCard emoji="💡" title="Suggestions for Tomorrow" content={debrief.suggestions} colorClass="bg-purple-50 border-purple-100" />

      {debrief.goal_connections && (
        <FeedbackCard emoji="🏁" title="Goal Connections" content={debrief.goal_connections} colorClass="bg-emerald-50 border-emerald-100" />
      )}
    </div>
  )
}

function FeedbackCard({ emoji, title, content, colorClass }: { emoji: string; title: string; content: string; colorClass: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${colorClass}`}>
      <h3 className="text-sm font-bold text-gray-700 mb-1.5">{emoji} {title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
    </div>
  )
}
