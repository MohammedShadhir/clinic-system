import { useNavigate } from "react-router-dom";
import { useDashboardData } from "../hooks/useDashboardData";
import StatCard from "../components/dashboard/StatCard";
import VisitsTable from "../components/dashboard/VisitsTable";
import { Card, CardHeader } from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";

const STATS = (visits, patients, finalized, drafts) => [
  {
    label: "Total Visits",
    value: visits,
    color: "#0d7c6b",
    bg: "#e6f4f1",
    icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>',
  },
  {
    label: "Finalized",
    value: finalized,
    color: "#1a7a3c",
    bg: "#e7f5ec",
    icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  },
  {
    label: "Drafts",
    value: drafts,
    color: "#c47c00",
    bg: "#fff4e0",
    icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  },
  {
    label: "Patients",
    value: patients,
    color: "#1a56a8",
    bg: "#e8f0fb",
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
  },
];

export default function Dashboard() {
  const { visits, patients, loading, finalized, drafts } = useDashboardData();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl p-4 sm:p-6 lg:p-8 fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1>
            Good morning, <em>Doctor</em>
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
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
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
        {STATS(visits.length, patients.length, finalized, drafts).map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="justify-between">
          <div className="flex items-center gap-2">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0d7c6b"
              strokeWidth="2"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            <h3>Recent Visits</h3>
          </div>
          <span className="text-xs text-ink-faint">{visits.length} total</span>
        </CardHeader>
        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner size={28} />
          </div>
        ) : (
          <VisitsTable visits={visits} onNavigate={navigate} />
        )}
      </Card>
    </div>
  );
}
