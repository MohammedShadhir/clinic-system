export default function TopBar({ onMenuClick }) {
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-bdr sticky top-0 z-30 shadow-card no-print">
      <button onClick={onMenuClick} className="p-1.5 rounded-btn hover:bg-surface-2 text-ink">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <span className="font-display text-lg">MediScript</span>
      <div className="w-8" />
    </div>
  )
}
