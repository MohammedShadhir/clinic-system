import { useNavigate } from "react-router-dom";
import { useNewVisit } from "../hooks/useNewVisit";
import { SAMPLE } from "../data/sampleData";
import WizardHeader from "../components/visit/WizardHeader";
import NotesInput from "../components/visit/NotesInput";
import {
  PrescriptionList,
  LabTestList,
  ClinicalNoteList,
} from "../components/visit/ReviewSection";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import {
  FormGroup,
  FormLabel,
  FormRow,
  Select,
} from "../components/ui/FormField";

function SummaryChips({ rxList, labList, noteList }) {
  const chips = [
    {
      n: rxList.length,
      label: "Drugs & Rx",
      bg: "bg-violet-light",
      text: "text-violet",
    },
    {
      n: labList.length,
      label: "Lab Tests",
      bg: "bg-sky-light",
      text: "text-sky",
    },
    {
      n: noteList.filter((x) => x.category !== "diagnosis").length,
      label: "Notes",
      bg: "bg-amber-light",
      text: "text-amber",
    },
    {
      n: noteList.filter((x) => x.category === "diagnosis").length,
      label: "Diagnoses",
      bg: "bg-rose-light",
      text: "text-rose",
    },
  ];
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {chips.map(({ n, label, bg, text }) => (
        <div
          key={label}
          className={`flex items-center gap-2 px-3 py-2 rounded-btn ${bg}`}
        >
          <span className={`font-display text-2xl leading-none ${text}`}>
            {n}
          </span>
          <span className={`text-xs font-semibold ${text}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function NewVisit() {
  const navigate = useNavigate();
  const v = useNewVisit();

  const upRx = (i, k, val) =>
    v.setRxList((a) => a.map((x, j) => (j === i ? { ...x, [k]: val } : x)));
  const upLab = (i, k, val) =>
    v.setLabList((a) => a.map((x, j) => (j === i ? { ...x, [k]: val } : x)));
  const upNote = (i, k, val) =>
    v.setNoteList((a) => a.map((x, j) => (j === i ? { ...x, [k]: val } : x)));

  return (
    <div className="flex flex-col min-h-screen ">
      <WizardHeader step={v.step} onBack={() => navigate("/")} />

      <div className="flex items-center w-full p-4 mx-auto max-w-7xl sm:p-6 lg:p-8">
        <div className="items-center w-full p-4 mx-auto sm:p-6">
          {/* ── Step 1: Input ── */}
          {v.step === 1 && (
            <div className="fade-up">
              <div className="mb-5">
                <h2>Unified Clinical Input</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Type or speak complete notes — drugs, tests, and observations
                  all in one place.
                </p>
              </div>

              <Card className="mb-4">
                <CardHeader>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0d7c6b"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <h3 className="text-base">Patient Details</h3>
                </CardHeader>
                <CardBody>
                  <FormRow>
                    <FormGroup>
                      <FormLabel required>Patient</FormLabel>
                      <Select
                        value={v.patientId}
                        onChange={(e) => v.setPatientId(e.target.value)}
                      >
                        <option value="">— Choose patient —</option>
                        {v.patients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                            {p.gender ? ` (${p.gender})` : ""}
                          </option>
                        ))}
                      </Select>
                      {v.patients.length === 0 && (
                        <p className="mt-1 text-xs text-ink-faint">
                          No patients.{" "}
                          <a href="/patients" className="text-teal">
                            Add one →
                          </a>
                        </p>
                      )}
                    </FormGroup>
                    <FormGroup>
                      <FormLabel>Doctor</FormLabel>
                      <Select
                        value={v.doctorId}
                        onChange={(e) => v.setDoctorId(e.target.value)}
                      >
                        {v.doctors.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} — {d.speciality}
                          </option>
                        ))}
                      </Select>
                    </FormGroup>
                  </FormRow>
                </CardBody>
              </Card>

              <NotesInput
                raw={v.raw}
                setRaw={v.setRaw}
                listen={v.listen}
                onStartListen={v.startListen}
                onStopListen={v.stopListen}
                onLoadSample={() => v.setRaw(SAMPLE)}
                onClassify={v.classify}
                busy={v.busy}
                disabled={!v.patientId || !v.raw.trim()}
              />
            </div>
          )}

          {/* ── Step 2: Review ── */}
          {v.step === 2 && (
            <div className="fade-up">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div>
                  <h2>Review AI Classification</h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Edit, add or remove items before finalizing.
                  </p>
                </div>
                {v.conf !== null && (
                  <div className="flex-shrink-0 px-4 py-2 text-center border bg-emerald-light border-emerald rounded-btn">
                    <div className="text-2xl leading-none font-display text-emerald">
                      {Math.round(v.conf * 100)}%
                    </div>
                    <div className="text-xs text-emerald font-semibold uppercase mt-0.5">
                      AI Confidence
                    </div>
                  </div>
                )}
              </div>

              <SummaryChips
                rxList={v.rxList}
                labList={v.labList}
                noteList={v.noteList}
              />

              <PrescriptionList
                list={v.rxList}
                onChange={upRx}
                onAdd={() =>
                  v.setRxList((a) => [
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
                onRemove={(i) =>
                  v.setRxList((a) => a.filter((_, j) => j !== i))
                }
              />
              <LabTestList
                list={v.labList}
                onChange={upLab}
                onAdd={() =>
                  v.setLabList((a) => [
                    ...a,
                    {
                      test_name: "",
                      test_code: "",
                      priority: "routine",
                      notes: "",
                    },
                  ])
                }
                onRemove={(i) =>
                  v.setLabList((a) => a.filter((_, j) => j !== i))
                }
              />
              <ClinicalNoteList
                list={v.noteList}
                onChange={upNote}
                onAdd={() =>
                  v.setNoteList((a) => [
                    ...a,
                    { category: "observation", content: "" },
                  ])
                }
                onRemove={(i) =>
                  v.setNoteList((a) => a.filter((_, j) => j !== i))
                }
              />

              <div className="flex items-center justify-between py-6">
                <Button variant="secondary" onClick={() => v.setStep(1)}>
                  ← Edit Notes
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={v.finalize}
                  disabled={v.busy}
                >
                  {v.busy ? (
                    <>
                      <Spinner /> Finalizing…
                    </>
                  ) : (
                    "Finalize & Generate Bill →"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {v.step === 3 && (
            <div className="pt-16 text-center fade-up">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-5 rounded-full bg-teal-light">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0d7c6b"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="mb-2">Visit Finalized</h2>
              <p className="mb-8 text-ink-muted">
                Prescriptions saved, lab orders created, and bill generated.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/")}
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/visits/" + v.visitId)}
                >
                  View Visit & Bill →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
