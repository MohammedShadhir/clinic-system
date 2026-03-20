export default function StatCard({ label, value, color, bg, icon }) {
  return (
    <div className="card stat">
      <div className="stat-icon" style={{ background: bg }}>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      </div>
      <div>
        <div className="stat-val" style={{ color }}>
          {value}
        </div>
        <div className="stat-lbl">{label}</div>
      </div>
    </div>
  );
}
