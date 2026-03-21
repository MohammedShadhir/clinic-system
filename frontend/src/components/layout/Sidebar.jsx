import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'Dashboard', end: true, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { to: '/visits/new', label: 'New Visit', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg> },
  { to: '/patients', label: 'Patients', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />}

      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-[220px] bg-white border-r border-bdr
        flex flex-col z-50 transition-transform duration-250
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        no-print
      `}>
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-bdr">
          <div className="w-9 h-9 rounded-lg bg-teal-light flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#0d7c6b" opacity="0.2"/>
              <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="#0d7c6b"/>
            </svg>
          </div>
          <div>
            <div className="font-display text-[1.05rem] leading-tight">MediScript</div>
            <div className="text-[0.68rem] text-ink-faint mt-0.5">ABC Health Clinic</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 flex flex-col gap-0.5">
          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-ink-faint px-2 mt-2 mb-1">Main</p>
          {NAV.map(({ to, label, end, icon }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2.5 py-2 rounded-btn text-sm transition-colors no-underline
                 ${isActive ? 'bg-teal-light text-teal font-medium' : 'text-ink-muted hover:bg-teal-light hover:text-teal-dark'}`
              }
            >
              {icon}{label}
            </NavLink>
          ))}
        </nav>

        {/* Doctor */}
        <div className="p-3 border-t border-bdr">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold flex-shrink-0">SC</div>
            <div>
              <div className="text-sm font-medium leading-tight">Dr. Sarah Chen</div>
              <div className="text-[0.68rem] text-ink-faint">General Practice</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
