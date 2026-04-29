import type { Milestone } from '../types'

interface Props {
  short_term_milestones: Milestone[]
  long_term_milestones: Milestone[]
}

interface ColumnColors {
  header: string
  line: string
  node: string
  card: string
}

const GREEN: ColumnColors = {
  header: 'text-green-600',
  line: 'bg-green-200',
  node: 'bg-green-400',
  card: 'bg-green-50 border-green-200 text-green-800',
}

const PURPLE: ColumnColors = {
  header: 'text-purple-600',
  line: 'bg-purple-200',
  node: 'bg-purple-400',
  card: 'bg-purple-50 border-purple-200 text-purple-800',
}

function PathColumn({ title, milestones, colors }: { title: string; milestones: Milestone[]; colors: ColumnColors }) {
  return (
    <div className="flex-1 flex flex-col items-center">
      <span className={`text-xs font-bold uppercase tracking-widest mb-3 ${colors.header}`}>{title}</span>
      <div className="relative w-full flex flex-col items-center gap-3 min-h-[220px]">
        <div className={`absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 ${colors.line}`} />
        <div className={`relative z-10 w-4 h-4 rounded-full border-2 border-white shadow ${colors.node}`} />
        {milestones.map(m => (
          <div
            key={m.id}
            className={`relative z-10 w-full rounded-xl px-3 py-2.5 text-center text-xs font-semibold shadow-sm border ${colors.card}`}
          >
            {m.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PathVisualization({ short_term_milestones, long_term_milestones }: Props) {
  const isEmpty = short_term_milestones.length === 0 && long_term_milestones.length === 0

  return (
    <div className="px-4">
      <div className="flex gap-4">
        <PathColumn title="Short-Term" milestones={short_term_milestones} colors={GREEN} />
        <PathColumn title="Long-Term" milestones={long_term_milestones} colors={PURPLE} />
      </div>
      {isEmpty && (
        <p className="mt-4 text-center text-sm text-gray-400 italic leading-relaxed">
          Your journey begins here — start journaling to unlock milestones.
        </p>
      )}
    </div>
  )
}
