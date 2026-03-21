import { useState, useEffect } from "react";
import { getPatients, createPatient } from "../utils/api";
import toast from "react-hot-toast";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import {
  FormGroup,
  FormLabel,
  FormRow,
  Input,
  Select,
} from "../components/ui/FormField";

const EMPTY = { name: "", date_of_birth: "", gender: "", phone: "", email: "" };

function PatientForm({ onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name required");
      return;
    }
    setSaving(true);
    try {
      await createPatient(form);
      toast.success("Patient registered!");
      onSave();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-5 fade-up">
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
        <h3>New Patient</h3>
      </CardHeader>
      <CardBody>
        <FormRow>
          <FormGroup>
            <FormLabel required>Full Name</FormLabel>
            <Input
              value={form.name}
              onChange={(e) => f("name", e.target.value)}
              placeholder="John Smith"
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Date of Birth</FormLabel>
            <Input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => f("date_of_birth", e.target.value)}
            />
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup>
            <FormLabel>Gender</FormLabel>
            <Select
              value={form.gender}
              onChange={(e) => f("gender", e.target.value)}
            >
              <option value="">Select…</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <FormLabel>Phone</FormLabel>
            <Input
              value={form.phone}
              onChange={(e) => f("phone", e.target.value)}
              placeholder="+1 555-000-0000"
            />
          </FormGroup>
        </FormRow>
        <FormGroup>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => f("email", e.target.value)}
            placeholder="patient@email.com"
          />
        </FormGroup>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Spinner /> Saving…
              </>
            ) : (
              "Register Patient"
            )}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    getPatients()
      .then((p) => setPatients(p || []))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-4xl p-4 sm:p-6 lg:p-8 fade-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1>Patients</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {patients.length} registered patients
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm((s) => !s)}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          {showForm ? "Cancel" : "Add Patient"}
        </Button>
      </div>

      {showForm && (
        <PatientForm
          onSave={() => {
            setShowForm(false);
            load();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <Card className="overflow-hidden">
        <CardHeader>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0d7c6b"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <h3>All Patients</h3>
        </CardHeader>
        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner size={26} />
          </div>
        ) : patients.length === 0 ? (
          <div className="py-12 text-sm text-center text-ink-faint">
            No patients registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 500 }}>
              <thead>
                <tr>
                  {["Name", "Gender", "Date of Birth", "Phone", "Email"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-bold uppercase tracking-wide text-ink-muted px-3 py-2.5 border-b border-bdr bg-surface-2 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-2">
                    <td className="px-3 py-2.5 border-b border-bdr">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-xs font-bold rounded-full bg-teal-light text-teal">
                          {p.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 border-b border-bdr text-ink-muted text-sm">
                      {p.gender || "—"}
                    </td>
                    <td className="px-3 py-2.5 border-b border-bdr text-ink-muted text-sm whitespace-nowrap">
                      {p.date_of_birth
                        ? new Date(p.date_of_birth).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" },
                          )
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 border-b border-bdr text-ink-muted text-sm">
                      {p.phone || "—"}
                    </td>
                    <td className="px-3 py-2.5 border-b border-bdr text-ink-muted text-sm">
                      {p.email || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
