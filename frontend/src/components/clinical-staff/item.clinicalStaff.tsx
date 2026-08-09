import { useState } from "react";
import { Pencil, Trash2, Lock, LockOpen } from "lucide-react";
import {
  type ClinicalStaff, updateClinicalStaff, deleteClinicalStaff,
  type ClinicalRole, CLINICAL_ROLE_LABELS, CLINICAL_ROLE_COLORS,
} from "../../api/clinicalStaff";

const ROLES = Object.entries(CLINICAL_ROLE_LABELS) as unknown as [ClinicalRole, string][];

interface Props {
  staff: ClinicalStaff;
  onUpdated: () => void;
  onDeleted: () => void;
  canEdit: boolean;
}

export default function ItemClinicalStaff({ staff, onUpdated, onDeleted, canEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(staff.name);
  const [role, setRole] = useState<ClinicalRole>(staff.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const color = CLINICAL_ROLE_COLORS[staff.role];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await updateClinicalStaff(staff.id, { name, role });
      setEditing(false); onUpdated();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to update."
      );
    } finally { setLoading(false); }
  };

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      await updateClinicalStaff(staff.id, { active: !staff.active });
      onUpdated();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to update status."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Remove ${staff.name}? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await deleteClinicalStaff(staff.id);
      onDeleted();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to delete."
      );
      setLoading(false);
    }
  };

  if (editing) {
    return (
      <form className="cs-item cs-item--editing" onSubmit={handleUpdate}>
        <div className="cs-item__fields">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <select value={role} onChange={(e) => setRole(e.target.value as ClinicalRole)}>
            {ROLES.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="cs-item__actions">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
          <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className={`cs-item ${!staff.active ? "cs-item--inactive" : ""}`}>
      <div className="cs-item__avatar" style={{ background: color }}>
        {staff.name.charAt(0).toUpperCase()}
      </div>
      <div className="cs-item__info">
        <span className="cs-item__name">{staff.name}</span>
        {!staff.active && <span className="cs-item__inactive-tag">Inactive</span>}
      </div>
      <span className="badge" style={{ color, borderColor: color }}>
        {CLINICAL_ROLE_LABELS[staff.role]}
      </span>
      {canEdit && (
        <div className="cs-item__actions">
          <button className="btn-ghost" onClick={() => setEditing(true)} disabled={loading} title="Edit">
            <Pencil size={15} />
          </button>
          <button className="btn-ghost" onClick={handleToggleActive} disabled={loading} title={staff.active ? "Deactivate" : "Reactivate"}>
            {staff.active ? <Lock size={15} /> : <LockOpen size={15} />}
          </button>
          <button className="btn-ghost" onClick={handleDelete} disabled={loading} title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      )}
      {error && <p className="field-error" style={{ width: "100%", marginTop: "0.25rem" }}>{error}</p>}
    </div>
  );
}