import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { type AppUser, updateUser, deleteUser, type UserRole } from "../../api/users";

const ROLE_LABELS: Record<UserRole, string> = {
  USER: "Receptionist",
  FINANCE: "Finance Officer",
  ADMIN: "Administrator",
};

const ROLE_VAR: Record<UserRole, string> = {
  USER: "var(--color-role-user)",
  FINANCE: "var(--color-role-finance)",
  ADMIN: "var(--color-role-admin)",
};

interface Props {
  user: AppUser;
  currentUserId: string;
  onUpdated: () => void;
  onDeleted: () => void;
}

export default function ItemUser({ user, currentUserId, onUpdated, onDeleted }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<UserRole>(user.role);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSelf = user.id === currentUserId;
  const color = ROLE_VAR[user.role];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await updateUser(user.id, { name, role, password: newPassword || undefined });
      setEditing(false); setNewPassword(""); onUpdated();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to update."
      );
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (isSelf || !confirm(`Remove ${user.name}'s account?`)) return;
    setLoading(true);
    try { await deleteUser(user.id); onDeleted(); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (editing) {
    return (
      <form className="user-item user-item--editing" onSubmit={handleUpdate}>
        <div className="user-item__fields">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            {(["USER", "FINANCE", "ADMIN"] as UserRole[]).map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (optional)" />
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="user-item__actions">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
          <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="user-item">
      <div className="user-item__avatar" style={{ background: color }}>
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="user-item__info">
        <span className="user-item__name">
          {user.name}
          {isSelf && <span className="user-item__you"> (you)</span>}
        </span>
        <span className="user-item__email">{user.email}</span>
      </div>
      <span className="badge" style={{ color, borderColor: color }}>
        {ROLE_LABELS[user.role]}
      </span>
      <div className="user-item__actions">
        <button className="btn-ghost" onClick={() => setEditing(true)} disabled={loading} title="Edit">
          <Pencil size={15} />
        </button>
        <button
          className="btn-ghost"
          onClick={handleDelete}
          disabled={loading || isSelf}
          title={isSelf ? "You can't delete your own account" : "Remove account"}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}