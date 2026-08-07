import { useEffect, useState } from "react";
import { getUsers, type AppUser, type UserRole } from "../../api/users";
import ItemUser from "./item.users";

const ROLE_LABELS: Record<string, string> = {
  ALL: "All",
  ADMIN: "Admins",
  FINANCE: "Finance",
  USER: "Receptionists",
};

interface Props {
  currentUserId: string;
  refreshTrigger: number;
}

export default function ListUsers({ currentUserId, refreshTrigger }: Props) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<UserRole | "ALL">("ALL");

  const fetchUsers = async () => {
    setLoading(true);
    try { setUsers(await getUsers()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [refreshTrigger]);

  const filtered = filter === "ALL" ? users : users.filter((u) => u.role === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div className="filter-bar">
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
          {users.length} {users.length === 1 ? "account" : "accounts"}
        </span>
        <div className="filter-pills">
          {(["ALL", "ADMIN", "FINANCE", "USER"] as const).map((r) => (
            <button key={r} className={`pill ${filter === r ? "active" : ""}`} onClick={() => setFilter(r)}>
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="user-item" style={{ pointerEvents: "none" }}>
              <div className="skel" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <div className="skel" style={{ width: "40%", height: 12 }} />
                <div className="skel" style={{ width: "60%", height: 10 }} />
              </div>
              <div className="skel" style={{ width: 80, height: 22, borderRadius: "var(--radius-full)" }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <p className="empty-state">No accounts found.</p>
        ) : (
          filtered.map((user) => (
            <ItemUser key={user.id} user={user} currentUserId={currentUserId} onUpdated={fetchUsers} onDeleted={fetchUsers} />
          ))
        )}
      </div>
    </div>
  );
}