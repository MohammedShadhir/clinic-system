import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useVisitDetail } from "../hooks/useVisitDetail";
import PrintDocument from "../components/visit/PrintDocument";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { Card, CardHeader, CardBody } from "../components/ui/Card";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
const fmtShort = (d) =>
  new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const CAT_LABEL = {
  chief_complaint: "Chief Complaint",
  history: "History",
  examination: "Examination",
  diagnosis: "Diagnosis",
  plan: "Plan",
  observation: "Observation",
};
const CAT_STYLE = {
  chief_complaint: "bg-amber-light text-amber border-l-amber-DEFAULT",
  history: "bg-surface-2 text-ink-muted border-l-bdr",
  examination: "bg-sky-light text-sky border-l-sky",
  diagnosis: "bg-rose-light text-rose border-l-rose",
  plan: "bg-teal-light text-teal border-l-teal",
  observation: "bg-surface-2 text-ink-muted border-l-bdr",
};

function InfoGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(([label, value]) => (
        <div key={label}>
          <div className="text-[0.68rem] uppercase tracking-wide text-ink-faint font-bold mb-0.5">
            {label}
          </div>
          <div className="text-sm">{value || "—"}</div>
        </div>
      ))}
    </div>
  );
}

function DataTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth: 480 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="text-left text-xs font-bold uppercase tracking-wide text-ink-muted px-3 py-2.5 border-b border-bdr bg-surface-2 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-surface-2">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 border-b border-bdr text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BillSummary({ bill, onMarkPaid, onPrint }) {
  const b = bill;
  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader>
          <h3 className="text-base">Summary</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-2">
            {[
              ["Consultation", b.consultation_fee],
              ["Drugs", b.drug_total],
              ["Lab Tests", b.lab_total],
              ["Tax (5%)", b.tax_amount],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span className="text-ink-muted">{l}</span>
                <span className="font-medium">${Number(v).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2.5 border-t border-bdr">
              <span className="font-semibold">TOTAL</span>
              <span className="text-2xl leading-none font-display text-teal">
                ${Number(b.total_amount).toFixed(2)}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
      {b.status !== "paid" && (
        <Button variant="primary" onClick={onMarkPaid}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Mark as Paid
        </Button>
      )}
      <Button variant="secondary" onClick={() => onPrint("bill")}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        Print Invoice
      </Button>
    </div>
  );
}

const TABS = ["overview", "prescriptions", "lab-tests", "notes", "bill"];

export default function VisitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { visit, loading, markPaid } = useVisitDetail(id);
  const [tab, setTab] = useState("overview");
  const [printMode, setPrintMode] = useState(null);

  const handlePrint = (mode) => {
    setPrintMode(mode);
    setTimeout(() => window.print(), 200);
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Spinner size={32} />
      </div>
    );
  if (!visit)
    return (
      <div className="p-20 text-center text-ink-faint">Visit not found.</div>
    );

  const b = visit.bill;

  return (
    <div className="min-h-screen">
      {/* Print area */}
      {printMode && (
        <div className="print-only">
          <PrintDocument visit={visit} mode={printMode} />
        </div>
      )}

      <div className="no-print">
        {/* Header */}
        <div className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-3 px-4 py-3 bg-white border-b border-bdr shadow-card">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate("/")}
              className="mt-1 p-1.5 rounded-btn hover:bg-surface-2 text-ink-muted"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M5 12l7-7M5 12l7 7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl">{visit.patient?.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge
                  type={visit.status === "finalized" ? "success" : "draft"}
                >
                  {visit.status}
                </Badge>
                <span className="text-xs text-ink-faint">
                  {fmtShort(visit.visit_date)}
                </span>
                <span className="font-mono text-xs text-ink-faint">
                  #{visit.id?.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["Print Rx", "prescription"],
              ["Print Lab", "lab"],
              ["Print Bill", "bill"],
            ].map(([l, m]) => (
              <Button
                key={m}
                variant="secondary"
                size="sm"
                onClick={() => handlePrint(m)}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                {l}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary strip */}
        <div className="flex overflow-x-auto bg-white border-b border-bdr">
          {[
            {
              label: "Prescriptions",
              val: visit.prescriptions?.length || 0,
              cls: "text-violet",
            },
            {
              label: "Lab Tests",
              val: visit.lab_tests?.length || 0,
              cls: "text-sky",
            },
            {
              label: "Notes",
              val: visit.clinical_notes?.length || 0,
              cls: "text-amber",
            },
            {
              label: "Total Bill",
              val: b ? `$${Number(b.total_amount).toFixed(2)}` : "—",
              cls: "text-teal",
            },
            {
              label: "Bill Status",
              val: b?.status || "N/A",
              cls: b?.status === "paid" ? "text-emerald" : "text-amber",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center flex-shrink-0 px-4 py-3 border-r border-bdr last:border-0"
            >
              <div className="text-[0.6rem] uppercase tracking-widest text-ink-faint font-bold mb-1 whitespace-nowrap">
                {s.label}
              </div>
              <div className={`font-display text-xl leading-none ${s.cls}`}>
                {s.val}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto bg-white border-b border-bdr">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tab ${tab === t ? "tab-active" : ""}`}
            >
              {t.replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="max-w-5xl p-4 sm:p-6">
          {/* Overview */}
          {tab === "overview" && (
            <div className="grid grid-cols-1 gap-4 fade-up md:grid-cols-2">
              <Card>
                <CardHeader>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0d7c6b"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <h3 className="text-base">Patient Info</h3>
                </CardHeader>
                <CardBody>
                  <InfoGrid
                    items={[
                      ["Name", visit.patient?.name],
                      ["Gender", visit.patient?.gender],
                      ["Phone", visit.patient?.phone],
                      ["Email", visit.patient?.email],
                    ]}
                  />
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0d7c6b"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <h3 className="text-base">Visit Info</h3>
                </CardHeader>
                <CardBody>
                  <div className="text-[0.68rem] uppercase tracking-wide text-ink-faint font-bold mb-0.5">
                    Date
                  </div>
                  <div className="mb-3 text-sm">
                    {fmtDate(visit.visit_date)}
                  </div>
                  <div className="text-[0.68rem] uppercase tracking-wide text-ink-faint font-bold mb-1">
                    Diagnoses
                  </div>
                  {visit.clinical_notes
                    ?.filter((n) => n.category === "diagnosis")
                    .map((n, i) => (
                      <div key={i} className="mb-1 text-sm text-rose">
                        {n.content}
                      </div>
                    ))}
                </CardBody>
              </Card>
              {visit.raw_input && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <h3 className="text-base">Original Notes</h3>
                  </CardHeader>
                  <CardBody>
                    <pre className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap border bg-canvas rounded-btn border-bdr">
                      {visit.raw_input}
                    </pre>
                  </CardBody>
                </Card>
              )}
            </div>
          )}

          {/* Prescriptions */}
          {tab === "prescriptions" && (
            <div className="fade-up">
              {!visit.prescriptions?.length ? (
                <div className="py-12 text-center text-ink-faint">
                  No prescriptions.
                </div>
              ) : (
                <Card className="overflow-hidden">
                  <DataTable
                    headers={[
                      "#",
                      "Drug",
                      "Dosage",
                      "Frequency",
                      "Duration",
                      "Route",
                      "Notes",
                      "Price",
                    ]}
                    rows={visit.prescriptions.map((rx, i) => [
                      <span className="text-ink-faint">{i + 1}</span>,
                      <span className="font-medium">{rx.drug_name}</span>,
                      rx.dosage || "—",
                      rx.frequency || "—",
                      rx.duration || "—",
                      rx.route || "—",
                      <span className="text-ink-muted">{rx.notes || "—"}</span>,
                      <span className="font-semibold text-teal">
                        ${Number(rx.unit_price).toFixed(2)}
                      </span>,
                    ])}
                  />
                </Card>
              )}
            </div>
          )}

          {/* Lab Tests */}
          {tab === "lab-tests" && (
            <div className="fade-up">
              {!visit.lab_tests?.length ? (
                <div className="py-12 text-center text-ink-faint">
                  No lab tests.
                </div>
              ) : (
                <Card className="overflow-hidden">
                  <DataTable
                    headers={[
                      "#",
                      "Test Name",
                      "Code",
                      "Priority",
                      "Notes",
                      "Price",
                    ]}
                    rows={visit.lab_tests.map((t, i) => [
                      <span className="text-ink-faint">{i + 1}</span>,
                      <span className="font-medium">{t.test_name}</span>,
                      <code className="bg-surface-2 px-1.5 py-0.5 rounded text-xs">
                        {t.test_code || "—"}
                      </code>,
                      <Badge
                        type={
                          t.priority === "urgent" || t.priority === "stat"
                            ? "urgent"
                            : "lab"
                        }
                      >
                        {t.priority || "routine"}
                      </Badge>,
                      <span className="text-ink-muted">{t.notes || "—"}</span>,
                      <span className="font-semibold text-teal">
                        ${Number(t.price).toFixed(2)}
                      </span>,
                    ])}
                  />
                </Card>
              )}
            </div>
          )}

          {/* Notes */}
          {tab === "notes" && (
            <div className="flex flex-col gap-3 fade-up">
              {!visit.clinical_notes?.length ? (
                <div className="py-12 text-center text-ink-faint">
                  No clinical notes.
                </div>
              ) : (
                visit.clinical_notes.map((note) => (
                  <div
                    key={note.id}
                    className={`card border-l-4 p-4 ${CAT_STYLE[note.category] || CAT_STYLE.observation}`}
                  >
                    <span className="inline-block mb-2 text-xs badge">
                      {CAT_LABEL[note.category] || note.category}
                    </span>
                    <p className="text-sm leading-relaxed">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Bill */}
          {tab === "bill" && (
            <div className="fade-up">
              {!b ? (
                <div className="py-12 text-center text-ink-faint">
                  No bill generated.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 items-start">
                  <Card className="overflow-hidden">
                    <CardHeader className="justify-between">
                      <h3 className="text-base">Line Items</h3>
                      <Badge type={b.status === "paid" ? "success" : "pending"}>
                        {b.status}
                      </Badge>
                    </CardHeader>
                    <DataTable
                      headers={[
                        "Description",
                        "Category",
                        "Qty",
                        "Unit",
                        "Total",
                      ]}
                      rows={(b.line_items || []).map((item) => [
                        item.description,
                        <Badge
                          type={
                            item.category === "drug"
                              ? "drug"
                              : item.category === "lab"
                                ? "lab"
                                : "note"
                          }
                        >
                          {item.category}
                        </Badge>,
                        item.quantity,
                        `$${Number(item.unit_price).toFixed(2)}`,
                        <span className="font-semibold">
                          ${Number(item.total).toFixed(2)}
                        </span>,
                      ])}
                    />
                  </Card>
                  <BillSummary
                    bill={b}
                    onMarkPaid={markPaid}
                    onPrint={handlePrint}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
