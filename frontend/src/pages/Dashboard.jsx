import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listVisits, getPatients } from "../utils/api";

export default function Dashboard() {
  const [visits, setVisits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([listVisits(), getPatients()])
      .then(([v, p]) => {
        setVisits(v || []);
        setPatients(p || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const finalized = visits.filter((v) => v.status === "finalized").length;
  const drafts = visits.filter((v) => v.status === "draft").length;

  const stats = [
    {
      label: "Total Visits",
      val: visits.length,
      color: "var(--teal)",
      bg: "var(--teal-l)",
      path: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>',
    },
    {
      label: "Finalized",
      val: finalized,
      color: "var(--green)",
      bg: "var(--green-l)",
      path: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    },
    {
      label: "Drafts",
      val: drafts,
      color: "var(--amber)",
      bg: "var(--amber-l)",
      path: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    },
    {
      label: "Patients",
      val: patients.length,
      color: "var(--blue)",
      bg: "var(--blue-l)",
      path: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
    },
  ];

  return (
    <div className="page fade-up">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 26,
        }}
      >
        <div>
          <h1>
            Good morning, <em>Doctor</em>
          </h1>
          <p
            style={{
              color: "var(--ink-muted)",
              fontSize: "0.9rem",
              marginTop: 4,
            }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate("/visits/new")}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Visit
        </button>
      </div>

      <div className="stats">
        {stats.map((s) => (
          <div key={s.label} className="card stat">
            <div className="stat-icon" style={{ background: s.bg }}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                dangerouslySetInnerHTML={{ __html: s.path }}
              />
            </div>
            <div>
              <div className="stat-val" style={{ color: s.color }}>
                {s.val}
              </div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div
          className="card-header"
          style={{ justifyContent: "space-between" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--teal)"
              strokeWidth="2"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            <h3>Recent Visits</h3>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--ink-faint)" }}>
            {visits.length} total
          </span>
        </div>

        {loading ? (
          <div
            style={{ padding: 40, display: "flex", justifyContent: "center" }}
          >
            <span className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : visits.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              color: "var(--ink-muted)",
            }}
          >
            <p style={{ marginBottom: 14 }}>No visits yet.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/visits/new")}
            >
              Create First Visit
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Drugs</th>
                  <th>Tests</th>
                  <th>Bill</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id} onClick={() => navigate("/visits/" + v.id)}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "var(--teal-l)",
                            color: "var(--teal)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {v.patient?.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {v.patient?.name || "Unknown"}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--ink-faint)",
                            }}
                          >
                            {v.patient?.gender || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}
                    >
                      {new Date(v.visit_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <span
                        className={`badge badge-${v.status === "finalized" ? "success" : "draft"}`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--violet)", fontWeight: 600 }}>
                      {v.prescriptions?.length ?? "—"}
                    </td>
                    <td style={{ color: "var(--blue)", fontWeight: 600 }}>
                      {v.lab_tests?.length ?? "—"}
                    </td>
                    <td style={{ color: "var(--teal)", fontWeight: 600 }}>
                      {v.bill
                        ? `$${Number(v.bill.total_amount).toFixed(2)}`
                        : "—"}
                    </td>
                    <td style={{ color: "var(--ink-faint)" }}>View →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
