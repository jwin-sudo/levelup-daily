interface StatCardProps {
  label: string
  value: number
  colorClass: string
}

export function StatCard({ label, value, colorClass }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col items-center gap-1 ${colorClass}`}>
      <span className="text-4xl font-black tracking-tight">{value.toLocaleString()}</span>
      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  )
}
