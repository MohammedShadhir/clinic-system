import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPatients,
  getDoctors,
  createVisit,
  finalizeVisit,
} from "../utils/api";
import toast from "react-hot-toast";
import { SAMPLE } from "../data/sampleData";

export default function NewVisit() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [visitId, setVisitId] = useState("");
  const [rxList, setRxList] = useState([]);
  const [labList, setLabList] = useState([]);
  const [noteList, setNoteList] = useState([]);
  const [conf, setConf] = useState(null);
  const [listen, setListen] = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    Promise.all([getPatients(), getDoctors()]).then(([p, d]) => {
      setPatients(p || []);
      setDoctors(d || []);
      if (d?.length) setDoctorId(d[0].id);
    });
  }, []);

  const startListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Speech not supported");
      return;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    let final = raw;
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += " " + e.results[i][0].transcript;
        else interim = e.results[i][0].transcript;
      }
      setRaw(final + (interim ? " " + interim : ""));
    };
    r.onerror = r.onend = () => setListen(false);
    r.start();
    recRef.current = r;
    setListen(true);
  };

  const classify = async () => {
    if (!patientId) {
      toast.error("Select a patient");
      return;
    }
    if (!raw.trim()) {
      toast.error("Enter notes first");
      return;
    }
    setBusy(true);
    try {
      const res = await createVisit({
        patient_id: patientId,
        doctor_id: doctorId,
        raw_input: raw,
      });
      setVisitId(res.visit.id);
      setRxList(res.ai_result.prescriptions || []);
      setLabList(res.ai_result.lab_tests || []);
      setNoteList(res.ai_result.clinical_notes || []);
      setConf(res.ai_result.confidence);
      setStep(2);
      toast.success("AI classification complete!");
    } catch (e) {
      toast.error(e.response?.data?.error || "Classification failed");
    } finally {
      setBusy(false);
    }
  };

  const finalize = async () => {
    setBusy(true);
    try {
      await finalizeVisit({
        visit_id: visitId,
        prescriptions: rxList,
        lab_tests: labList,
        clinical_notes: noteList,
      });
      setStep(3);
      toast.success("Visit finalized!");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed");
    } finally {
      setBusy(false);
    }
  };

  const upRx = (i, k, v) =>
    setRxList((a) => a.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const upLab = (i, k, v) =>
    setLabList((a) => a.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const upNote = (i, k, v) =>
    setNoteList((a) => a.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const catColors = {
    chief_complaint: { bg: "var(--amber-l)", color: "var(--amber)" },
    history: { bg: "var(--surface2)", color: "var(--ink-muted)" },
    examination: { bg: "var(--blue-l)", color: "var(--blue)" },
    diagnosis: { bg: "var(--rose-l)", color: "var(--rose)" },
    plan: { bg: "var(--teal-l)", color: "var(--teal)" },
    observation: { bg: "var(--surface2)", color: "var(--ink-muted)" },
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* Wizard header */}
      <div className="wiz-header no-print">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          Back
        </button>
        <div className="wiz-steps">
          {["Input Notes", "Review & Edit", "Done"].map((s, i) => (
            <div key={i} className="wiz-step">
              <div
                className={`step-dot ${step > i + 1 ? "done" : step === i + 1 ? "on" : ""}`}
              >
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`step-lbl${step === i + 1 ? " on" : ""}`}>
                {s}
              </span>
            </div>
          ))}
        </div>
        <div style={{ width: 80 }} />
      </div>

      <div className="page">
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="fade-up">
            <div style={{ marginBottom: 22 }}>
              <h2>Unified Clinical Input</h2>
              <p
                style={{
                  color: "var(--ink-muted)",
                  fontSize: "0.875rem",
                  marginTop: 4,
                }}
              >
                Type or speak complete notes — drugs, tests, and observations
                all in one place.
              </p>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--teal)"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <h3>Patient Details</h3>
              </div>
              <div className="card-body">
                <div className="fr">
                  <div className="fg">
                    <label>Select Patient *</label>
                    <select
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                    >
                      <option value="">— Choose patient —</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                          {p.gender ? ` (${p.gender})` : ""}
                        </option>
                      ))}
                    </select>
                    {patients.length === 0 && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--ink-faint)",
                          marginTop: 4,
                        }}
                      >
                        No patients.{" "}
                        <a href="/patients" style={{ color: "var(--teal)" }}>
                          Add one →
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="fg">
                    <label>Doctor</label>
                    <select
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                    >
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} — {d.speciality}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
              <div
                className="card-header"
                style={{ justifyContent: "space-between" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--teal)"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <h3>Clinical Notes</h3>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className={`btn btn-sm ${listen ? "btn-danger" : "btn-secondary"}`}
                    onClick={
                      listen
                        ? () => {
                            recRef.current?.stop();
                            setListen(false);
                          }
                        : startListen
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
                      <path d="M19 10v2a7 7 0 01-14 0v-2" />
                    </svg>
                    {listen ? "Stop" : "Dictate"}
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setRaw(SAMPLE)}
                  >
                    Load Sample
                  </button>
                </div>
              </div>
              {listen && (
                <div className="listen-bar">
                  <span className="listen-dot" />
                  Listening…
                </div>
              )}
              <textarea
                className="notes-area"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                rows={14}
                placeholder="Enter complete clinical notes — medications, lab tests, observations, diagnoses, and plans all together..."
              />
              <div className="notes-foot">
                <span
                  style={{ fontSize: "0.75rem", color: "var(--ink-faint)" }}
                >
                  {raw.length} characters
                </span>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={classify}
                  disabled={busy || !patientId || !raw.trim()}
                >
                  {busy ? (
                    <>
                      <span className="spinner" /> Classifying…
                    </>
                  ) : (
                    <>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      Classify with AI
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="fade-up">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 18,
              }}
            >
              <div>
                <h2>Review AI Classification</h2>
                <p
                  style={{
                    color: "var(--ink-muted)",
                    fontSize: "0.875rem",
                    marginTop: 4,
                  }}
                >
                  Edit, add or remove items before finalizing.
                </p>
              </div>
              {conf !== null && (
                <div className="conf-box">
                  <div className="conf-n">{Math.round(conf * 100)}%</div>
                  <div className="conf-l">AI Confidence</div>
                </div>
              )}
            </div>

            <div className="chips">
              {[
                {
                  n: rxList.length,
                  label: "Drugs & Rx",
                  bg: "var(--violet-l)",
                  color: "var(--violet)",
                },
                {
                  n: labList.length,
                  label: "Lab Tests",
                  bg: "var(--blue-l)",
                  color: "var(--blue)",
                },
                {
                  n: noteList.filter((x) => x.category !== "diagnosis").length,
                  label: "Notes",
                  bg: "var(--amber-l)",
                  color: "var(--amber)",
                },
                {
                  n: noteList.filter((x) => x.category === "diagnosis").length,
                  label: "Diagnoses",
                  bg: "var(--rose-l)",
                  color: "var(--rose)",
                },
              ].map(({ n, label, bg, color }) => (
                <div key={label} className="chip" style={{ background: bg }}>
                  <span className="chip-n" style={{ color }}>
                    {n}
                  </span>
                  <span className="chip-l" style={{ color }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Prescriptions */}
            <div
              className="card"
              style={{ overflow: "hidden", marginBottom: 16 }}
            >
              <div
                className="review-head"
                style={{ justifyContent: "space-between" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    className="review-icon"
                    style={{ background: "var(--violet-l)" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--violet)"
                      strokeWidth="2"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <h3>
                    Prescriptions{" "}
                    <span style={{ color: "var(--violet)" }}>
                      {rxList.length}
                    </span>
                  </h3>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    setRxList((a) => [
                      ...a,
                      {
                        drug_name: "",
                        dosage: "",
                        frequency: "",
                        duration: "",
                        route: "oral",
                        notes: "",
                      },
                    ])
                  }
                >
                  + Add Drug
                </button>
              </div>
              {rxList.length === 0 ? (
                <p
                  style={{
                    padding: 18,
                    textAlign: "center",
                    color: "var(--ink-faint)",
                    fontSize: "0.85rem",
                  }}
                >
                  No drugs classified.
                </p>
              ) : (
                rxList.map((rx, i) => (
                  <div key={i} className="pitem">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                        {rx.drug_name || "Drug"}
                      </span>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ marginLeft: "auto", color: "var(--rose)" }}
                        onClick={() =>
                          setRxList((a) => a.filter((_, j) => j !== i))
                        }
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="pgrid">
                      {[
                        ["drug_name", "Drug Name"],
                        ["dosage", "Dosage"],
                        ["frequency", "Frequency"],
                        ["duration", "Duration"],
                        ["route", "Route"],
                      ].map(([f, l]) => (
                        <div key={f} className="fg">
                          <label>{l}</label>
                          <input
                            value={rx[f] || ""}
                            onChange={(e) => upRx(i, f, e.target.value)}
                          />
                        </div>
                      ))}
                      <div className="fg" style={{ gridColumn: "1/-1" }}>
                        <label>Instructions</label>
                        <input
                          value={rx.notes || ""}
                          onChange={(e) => upRx(i, "notes", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Lab Tests */}
            <div
              className="card"
              style={{ overflow: "hidden", marginBottom: 16 }}
            >
              <div
                className="review-head"
                style={{ justifyContent: "space-between" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    className="review-icon"
                    style={{ background: "var(--blue-l)" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--blue)"
                      strokeWidth="2"
                    >
                      <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2" />
                      <path d="M8.5 2h7" />
                    </svg>
                  </div>
                  <h3>
                    Lab Tests{" "}
                    <span style={{ color: "var(--blue)" }}>
                      {labList.length}
                    </span>
                  </h3>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    setLabList((a) => [
                      ...a,
                      {
                        test_name: "",
                        test_code: "",
                        priority: "routine",
                        notes: "",
                      },
                    ])
                  }
                >
                  + Add Test
                </button>
              </div>
              {labList.length === 0 ? (
                <p
                  style={{
                    padding: 18,
                    textAlign: "center",
                    color: "var(--ink-faint)",
                    fontSize: "0.85rem",
                  }}
                >
                  No lab tests classified.
                </p>
              ) : (
                labList.map((t, i) => (
                  <div key={i} className="pitem">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                        {t.test_name || "Test"}
                      </span>
                      <span
                        className={`badge badge-${t.priority === "urgent" || t.priority === "stat" ? "urgent" : "lab"}`}
                      >
                        {t.priority || "routine"}
                      </span>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ marginLeft: "auto", color: "var(--rose)" }}
                        onClick={() =>
                          setLabList((a) => a.filter((_, j) => j !== i))
                        }
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="pgrid">
                      <div className="fg">
                        <label>Test Name</label>
                        <input
                          value={t.test_name}
                          onChange={(e) =>
                            upLab(i, "test_name", e.target.value)
                          }
                        />
                      </div>
                      <div className="fg">
                        <label>Code</label>
                        <input
                          value={t.test_code}
                          onChange={(e) =>
                            upLab(i, "test_code", e.target.value)
                          }
                        />
                      </div>
                      <div className="fg">
                        <label>Priority</label>
                        <select
                          value={t.priority || "routine"}
                          onChange={(e) => upLab(i, "priority", e.target.value)}
                        >
                          <option value="routine">Routine</option>
                          <option value="urgent">Urgent</option>
                          <option value="stat">STAT</option>
                        </select>
                      </div>
                      <div className="fg" style={{ gridColumn: "1/-1" }}>
                        <label>Notes</label>
                        <input
                          value={t.notes}
                          onChange={(e) => upLab(i, "notes", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Clinical Notes */}
            <div
              className="card"
              style={{ overflow: "hidden", marginBottom: 0 }}
            >
              <div
                className="review-head"
                style={{ justifyContent: "space-between" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    className="review-icon"
                    style={{ background: "var(--amber-l)" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--amber)"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    </svg>
                  </div>
                  <h3>
                    Clinical Notes{" "}
                    <span style={{ color: "var(--amber)" }}>
                      {noteList.length}
                    </span>
                  </h3>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    setNoteList((a) => [
                      ...a,
                      { category: "observation", content: "" },
                    ])
                  }
                >
                  + Add Note
                </button>
              </div>
              {noteList.length === 0 ? (
                <p
                  style={{
                    padding: 18,
                    textAlign: "center",
                    color: "var(--ink-faint)",
                    fontSize: "0.85rem",
                  }}
                >
                  No notes classified.
                </p>
              ) : (
                noteList.map((n, i) => {
                  const cc = catColors[n.category] || catColors.observation;
                  return (
                    <div
                      key={i}
                      className="pitem"
                      style={{ borderLeft: `3px solid ${cc.color}` }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <span
                          className="badge"
                          style={{ background: cc.bg, color: cc.color }}
                        >
                          {(n.category || "note").replace("_", " ")}
                        </span>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ marginLeft: "auto", color: "var(--rose)" }}
                          onClick={() =>
                            setNoteList((a) => a.filter((_, j) => j !== i))
                          }
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div
                        className="pgrid"
                        style={{ gridTemplateColumns: "1fr" }}
                      >
                        <div className="fg">
                          <label>Category</label>
                          <select
                            value={n.category}
                            onChange={(e) =>
                              upNote(i, "category", e.target.value)
                            }
                          >
                            <option value="chief_complaint">
                              Chief Complaint
                            </option>
                            <option value="history">History</option>
                            <option value="examination">Examination</option>
                            <option value="diagnosis">Diagnosis</option>
                            <option value="plan">Plan</option>
                            <option value="observation">Observation</option>
                          </select>
                        </div>
                        <div className="fg">
                          <label>Content</label>
                          <textarea
                            rows={2}
                            value={n.content}
                            onChange={(e) =>
                              upNote(i, "content", e.target.value)
                            }
                            style={{ resize: "vertical" }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 0 40px",
              }}
            >
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                ← Edit Notes
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={finalize}
                disabled={busy}
              >
                {busy ? (
                  <>
                    <span className="spinner" /> Finalizing…
                  </>
                ) : (
                  "Finalize & Generate Bill →"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="success fade-up">
            <div className="success-icon">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--teal)"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 style={{ marginBottom: 8 }}>Visit Finalized</h2>
            <p style={{ color: "var(--ink-muted)", marginBottom: 32 }}>
              Prescriptions saved, lab orders created, and bill generated.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => navigate("/")}
              >
                Back to Dashboard
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/visits/" + visitId)}
              >
                View Visit & Bill →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
