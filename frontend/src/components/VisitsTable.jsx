// components/VisitsTable.js
import { useNavigate } from "react-router-dom";

export default function VisitsTable({ visits }) {
  const navigate = useNavigate();

  return (
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
                <div className="patient-info">
                  <div className="patient-avatar">
                    {v.patient?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div className="patient-name">
                      {v.patient?.name || "Unknown"}
                    </div>
                    <div className="patient-gender">
                      {v.patient?.gender || ""}
                    </div>
                  </div>
                </div>
              </td>
              <td className="visit-date">
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
              <td className="drugs-count">{v.prescriptions?.length ?? "—"}</td>
              <td className="tests-count">{v.lab_tests?.length ?? "—"}</td>
              <td className="bill-amount">
                {v.bill ? `$${Number(v.bill.total_amount).toFixed(2)}` : "—"}
              </td>
              <td className="view-link">View →</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
