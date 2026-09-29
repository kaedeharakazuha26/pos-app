type StatCardProps = {
  label: string
  value: string
  subtext: string
  accent?: boolean
}

export function StatCard({ label, value, subtext, accent = false }: StatCardProps) {
  return (
    <div className={`stat-card ${accent ? 'accent' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{subtext}</small>
    </div>
  )
}
