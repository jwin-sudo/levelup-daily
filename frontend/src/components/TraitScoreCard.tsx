interface TraitScoreCardProps {
  trait: string
  score: number
}

export function TraitScoreCard({ trait, score }: TraitScoreCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-sm">
      <span className="text-sm font-semibold text-gray-700">{trait}</span>
      <span className="text-xl font-black text-gray-800">{score}</span>
    </div>
  )
}
