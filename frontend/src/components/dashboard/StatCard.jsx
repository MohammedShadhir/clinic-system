export default function StatCard({ label, value, color, bg, icon }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" dangerouslySetInnerHTML={{ __html: icon }} />
      </div>
      <div>
        <div className="font-display text-[1.7rem] leading-none" style={{ color }}>{value}</div>
        <div className="text-xs text-ink-muted mt-1 font-medium">{label}</div>
      </div>
    </div>
  )
}
