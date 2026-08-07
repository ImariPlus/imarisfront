import { useEffect, useState } from "react";
import { getClinicalStaff, type ClinicalStaff, type ClinicalRole, CLINICAL_ROLE_LABELS } from "../../api/clinicalStaff";
import ItemClinicalStaff from "./item.clinicalStaff";
import { jwtDecode } from "jwt-decode";

interface JwtPayload { id: string; role: string; }

const FILTERS = ["ALL", "ACTIVE", "INACTIVE", ...Object.keys(CLINICAL_ROLE_LABELS)] as const;
type Filter = typeof FILTERS[number];

interface Props { refreshTrigger: number; }

export default function ListClinicalStaff({ refreshTrigger }: Props) {
  const [staff, setStaff] = useState<ClinicalStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");

  const token = localStorage.getItem("token");
  let userRole = "USER";
  if (token) {
    try { userRole = jwtDecode<JwtPayload>(token).role; } catch (err) { console.warn(err); }
  }
  const canEdit = userRole === "ADMIN";

  const fetchStaff = async () => {
    setLoading(true);
    try { setStaff(await getClinicalStaff()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, [refreshTrigger]);

  const filtered = staff.filter((s) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return s.active;
    if (filter === "INACTIVE") return !s.active;
    return s.role === filter;
  });

  const activeCount = staff.filter((s) => s.active).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div className="filter-bar">
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
          {activeCount} active · {staff.length} total
        </span>
        <div className="filter-pills">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`pill ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "ALL" ? "All" :
               f === "ACTIVE" ? "Active" :
               f === "INACTIVE" ? "Inactive" :
               CLINICAL_ROLE_LABELS[f as ClinicalRole]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="cs-item" style={{ pointerEvents: "none" }}>
              <div className="skel" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <div className="skel" style={{ width: "40%", height: 12 }} />
              </div>
              <div className="skel" style={{ width: 90, height: 22, borderRadius: "var(--radius-full)" }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <p className="empty-state">No staff found.</p>
        ) : (
          filtered.map((s) => (
            <ItemClinicalStaff
              key={s.id}
              staff={s}
              canEdit={canEdit}
              onUpdated={fetchStaff}
              onDeleted={fetchStaff}
            />
          ))
        )}
      </div>
    </div>
  );
}