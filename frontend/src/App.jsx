import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import NewVisit from "./pages/NewVisit";
import VisitDetail from "./pages/VisitDetail";
import Patients from "./pages/Patients";

function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={"sidebar-overlay" + (open ? " open" : "")}
        onClick={onClose}
      />
      <aside className={"sidebar" + (open ? " open" : "") + " no-print"}>
        <div className="sb-brand">
          <div className="sb-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                fill="#0d7c6b"
                opacity="0.2"
              />
              <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="#0d7c6b" />
            </svg>
          </div>
          <div>
            <div className="sb-name">MediScript</div>
            <div className="sb-sub">ABC Health Clinic</div>
          </div>
        </div>
        <nav className="sb-nav">
          <div className="sb-section">Main</div>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "sb-link" + (isActive ? " active" : "")
            }
            onClick={onClose}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </NavLink>
          <NavLink
            to="/visits/new"
            className={({ isActive }) =>
              "sb-link" + (isActive ? " active" : "")
            }
            onClick={onClose}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Visit
          </NavLink>
          <NavLink
            to="/patients"
            className={({ isActive }) =>
              "sb-link" + (isActive ? " active" : "")
            }
            onClick={onClose}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Patients
          </NavLink>
        </nav>
        <div className="sb-footer">
          <div className="dr-card">
            <div className="dr-avatar">SC</div>
            <div>
              <div className="dr-name">Dr. Sarah Chen</div>
              <div className="dr-role">General Practice</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main">
          <div className="mobile-topbar no-print">
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="mobile-topbar-title">MediScript</span>
            <div style={{ width: 34 }} />
          </div>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/visits/new" element={<NewVisit />} />
            <Route path="/visits/:id" element={<VisitDetail />} />
            <Route path="/patients" element={<Patients />} />
          </Routes>
        </div>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "DM Sans,sans-serif",
            fontSize: "0.875rem",
            borderRadius: "6px",
          },
          success: { iconTheme: { primary: "#0d7c6b", secondary: "white" } },
        }}
      />
    </BrowserRouter>
  );
}
