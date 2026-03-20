// components/DashboardHeader.js
import { useNavigate } from "react-router-dom";

export default function DashboardHeader() {
  const navigate = useNavigate();
  return (
    <div className="dashboard-header">
      <div>
        <h1>
          Good morninghhhh, <em>Doctor</em>
        </h1>
        <p className="date-text">
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
  );
}
