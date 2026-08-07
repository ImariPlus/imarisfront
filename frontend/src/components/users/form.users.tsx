import { useState } from "react";
import { createUser, type UserRole } from "../../api/users";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "USER", label: "Receptionist / Cashier" },
  { value: "FINANCE", label: "Finance Officer" },
  { value: "ADMIN", label: "Administrator" },
];

export default function FormUsers({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password) return setError("All fields are required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      await createUser({ name: name.trim(), email: email.trim(), password, role });
      setName(""); setEmail(""); setPassword(""); setRole("USER");
      onSuccess?.();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Failed to create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
      <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600, marginBottom: "var(--space-4)" }}>
        Add staff account
      </h3>

      <div className="form-group">
        <label>Full name</label>
        <input type="text" placeholder="e.g. Jane Uwase" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input type="email" placeholder="jane@clinic.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Temporary password</label>
        <input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {error && <p className="field-error" style={{ marginBottom: "var(--space-3)" }}>{error}</p>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}