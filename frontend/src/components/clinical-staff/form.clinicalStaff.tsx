import { useState } from "react";
import { createClinicalStaff, type ClinicalRole, CLINICAL_ROLE_LABELS } from "../../api/clinicalStaff";

const ROLES = Object.entries(CLINICAL_ROLE_LABELS) as [ClinicalRole, string][];

export default function FormClinicalStaff({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<ClinicalRole>("DOCTOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Name is required.");
    setLoading(true);
    try {
      await createClinicalStaff({ name: name.trim(), role });
      setName(""); setRole("DOCTOR");
      onSuccess?.();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to add staff member."
      );
    } finally { setLoading(false); }
  };

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
      <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600, marginBottom: "var(--space-4)" }}>
        Add clinical staff
      </h3>

      <div className="form-group">
        <label>Full name</label>
        <input
          type="text"
          placeholder="e.g. Dr. Uwase Marie"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value as ClinicalRole)}>
          {ROLES.map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {error && <p className="field-error" style={{ marginBottom: "var(--space-3)" }}>{error}</p>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Adding..." : "Add staff member"}
      </button>
    </form>
  );
}