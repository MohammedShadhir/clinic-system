import Button from "../ui/Button";
import { Input, Select, Textarea, FormGroup } from "../ui/FormField";
import Badge from "../ui/Badge";

function RemoveBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 p-1 ml-auto transition-colors rounded text-rose hover:bg-rose-light"
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
  );
}

export function PrescriptionList({ list, onChange, onAdd, onRemove }) {
  return (
    <div className="mb-4 overflow-hidden card">
      <div className="flex-wrap justify-between gap-2 card-header">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded w-7 h-7 bg-violet-light">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b3fa0"
              strokeWidth="2"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h3 className="text-base">
            Prescriptions{" "}
            <span className="text-violet font-display">{list.length}</span>
          </h3>
        </div>
        <Button variant="secondary" size="sm" onClick={onAdd}>
          + Add Drug
        </Button>
      </div>
      {list.length === 0 ? (
        <p className="p-4 text-sm text-center text-ink-faint">
          No drugs classified.
        </p>
      ) : (
        list.map((rx, i) => (
          <div
            key={i}
            className="p-4 transition-colors border-b border-bdr last:border-0 hover:bg-canvas"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">
                {rx.drug_name || "Drug"}
              </span>
              <RemoveBtn onClick={() => onRemove(i)} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                ["drug_name", "Drug Name"],
                ["dosage", "Dosage"],
                ["frequency", "Frequency"],
                ["duration", "Duration"],
                ["route", "Route"],
              ].map(([f, l]) => (
                <FormGroup key={f}>
                  <label className="form-label">{l}</label>
                  <Input
                    className="text-sm py-1.5 px-2"
                    value={rx[f] || ""}
                    onChange={(e) => onChange(i, f, e.target.value)}
                  />
                </FormGroup>
              ))}
              <FormGroup className="col-span-2 sm:col-span-3">
                <label className="form-label">Instructions</label>
                <Input
                  className="text-sm py-1.5 px-2"
                  value={rx.notes || ""}
                  onChange={(e) => onChange(i, "notes", e.target.value)}
                />
              </FormGroup>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function LabTestList({ list, onChange, onAdd, onRemove }) {
  return (
    <div className="mb-4 overflow-hidden card">
      <div className="flex-wrap justify-between gap-2 card-header">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded w-7 h-7 bg-sky-light">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1a56a8"
              strokeWidth="2"
            >
              <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2" />
              <path d="M8.5 2h7" />
            </svg>
          </div>
          <h3 className="text-base">
            Lab Tests{" "}
            <span className="text-sky font-display">{list.length}</span>
          </h3>
        </div>
        <Button variant="secondary" size="sm" onClick={onAdd}>
          + Add Test
        </Button>
      </div>
      {list.length === 0 ? (
        <p className="p-4 text-sm text-center text-ink-faint">
          No lab tests classified.
        </p>
      ) : (
        list.map((t, i) => (
          <div
            key={i}
            className="p-4 transition-colors border-b border-bdr last:border-0 hover:bg-canvas"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">
                {t.test_name || "Test"}
              </span>
              <Badge
                type={
                  t.priority === "urgent" || t.priority === "stat"
                    ? "urgent"
                    : "lab"
                }
              >
                {t.priority || "routine"}
              </Badge>
              <RemoveBtn onClick={() => onRemove(i)} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <FormGroup>
                <label className="form-label">Test Name</label>
                <Input
                  className="text-sm py-1.5 px-2"
                  value={t.test_name}
                  onChange={(e) => onChange(i, "test_name", e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <label className="form-label">Code</label>
                <Input
                  className="text-sm py-1.5 px-2"
                  value={t.test_code}
                  onChange={(e) => onChange(i, "test_code", e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <label className="form-label">Priority</label>
                <Select
                  className="text-sm py-1.5 px-2"
                  value={t.priority || "routine"}
                  onChange={(e) => onChange(i, "priority", e.target.value)}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT</option>
                </Select>
              </FormGroup>
              <FormGroup className="col-span-2 sm:col-span-3">
                <label className="form-label">Notes</label>
                <Input
                  className="text-sm py-1.5 px-2"
                  value={t.notes}
                  onChange={(e) => onChange(i, "notes", e.target.value)}
                />
              </FormGroup>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const CAT_COLORS = {
  chief_complaint: {
    bg: "bg-amber-light",
    text: "text-amber",
    border: "border-l-amber",
  },
  history: {
    bg: "bg-surface-2",
    text: "text-ink-muted",
    border: "border-l-bdr-strong",
  },
  examination: { bg: "bg-sky-light", text: "text-sky", border: "border-l-sky" },
  diagnosis: {
    bg: "bg-rose-light",
    text: "text-rose",
    border: "border-l-rose",
  },
  plan: { bg: "bg-teal-light", text: "text-teal", border: "border-l-teal" },
  observation: {
    bg: "bg-surface-2",
    text: "text-ink-muted",
    border: "border-l-bdr-strong",
  },
};

export function ClinicalNoteList({ list, onChange, onAdd, onRemove }) {
  return (
    <div className="mb-4 overflow-hidden card">
      <div className="flex-wrap justify-between gap-2 card-header">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded w-7 h-7 bg-amber-light">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c47c00"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            </svg>
          </div>
          <h3 className="text-base">
            Clinical Notes{" "}
            <span className="text-amber font-display">{list.length}</span>
          </h3>
        </div>
        <Button variant="secondary" size="sm" onClick={onAdd}>
          + Add Note
        </Button>
      </div>
      {list.length === 0 ? (
        <p className="p-4 text-sm text-center text-ink-faint">
          No notes classified.
        </p>
      ) : (
        list.map((n, i) => {
          const cc = CAT_COLORS[n.category] || CAT_COLORS.observation;
          return (
            <div
              key={i}
              className={`p-4 border-b border-bdr last:border-0 border-l-4 ${cc.border}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`badge ${cc.bg} ${cc.text}`}>
                  {(n.category || "note").replace("_", " ")}
                </span>
                <RemoveBtn onClick={() => onRemove(i)} />
              </div>
              <div className="flex flex-col gap-2">
                <FormGroup>
                  <label className="form-label">Category</label>
                  <Select
                    className="text-sm py-1.5 px-2"
                    value={n.category}
                    onChange={(e) => onChange(i, "category", e.target.value)}
                  >
                    <option value="chief_complaint">Chief Complaint</option>
                    <option value="history">History</option>
                    <option value="examination">Examination</option>
                    <option value="diagnosis">Diagnosis</option>
                    <option value="plan">Plan</option>
                    <option value="observation">Observation</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <label className="form-label">Content</label>
                  <Textarea
                    className="text-sm w-full py-1.5 px-2"
                    rows={2}
                    value={n.content}
                    onChange={(e) => onChange(i, "content", e.target.value)}
                    style={{ resize: "vertical" }}
                  />
                </FormGroup>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
