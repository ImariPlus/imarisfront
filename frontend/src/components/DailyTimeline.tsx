import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { jwtDecode } from "jwt-decode";
import "../styles/DailyTimeline.css";

interface TimelineEntry {
  id: string;
  type: "TRANSACTION" | "EXPENSE" | "PAYROLL" | "NOTE";
  action: string | null;
  createdAt: string;
  performedBy: { id: string; name: string } | null;
  approvedBy: { id: string; name: string } | null;
  metadata: Record<string, unknown> | null;
}

interface JwtPayload { id: string; role: string; }

const LABELS: Record<TimelineEntry["type"], string> = {
  TRANSACTION: "Transaction",
  EXPENSE: "Expense",
  PAYROLL: "Payroll",
  NOTE: "Note",
};

const DailyTimeline: React.FC = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  // Add note form
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const token = localStorage.getItem("token");
  const userRole = useMemo(() => {
    if (!token) return "USER";
    try { return jwtDecode<JwtPayload>(token).role ?? "USER"; }
    catch { return "USER"; }
  }, [token]);

  const canManage = userRole === "ADMIN" || userRole === "FINANCE";

  const fetchTimeline = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/api/timeline");
      setEntries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load the timeline.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTimeline(); }, []);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await api.post("/api/timeline", {
        type: "NOTE",
        action: "CREATED",
        metadata: { note: newNote.trim() },
      });
      setNewNote(""); setShowAddNote(false);
      await fetchTimeline();
    } catch (err) {
      console.error(err);
      alert("Failed to add note.");
    } finally { setAddingNote(false); }
  };

  const handleSaveNote = async (entry: TimelineEntry) => {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await api.put(`/api/timeline/${entry.id}`, {
        type: "NOTE",
        action: entry.action,
        metadata: { note: noteText.trim() },
      });
      setEditingNote(null); setNoteText("");
      await fetchTimeline();
    } catch (err) {
      console.error(err);
      alert("Failed to update note.");
    } finally { setSaving(false); }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      await api.delete(`/api/timeline/${id}`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete note.");
    }
  };

  const getSummary = (entry: TimelineEntry) => {
    const m = entry.metadata ?? {};
    switch (entry.type) {
      case "TRANSACTION":
        return <>Received payment{m.clientName && <> from <strong>{String(m.clientName)}</strong></>}{typeof m.amount === "number" && <> — <strong>{Number(m.amount).toLocaleString()} RWF</strong></>}</>;
      case "EXPENSE":
        return <>Expense recorded{m.title && <>: <strong>{String(m.title)}</strong></>}{typeof m.amount === "number" && <> — <strong>{Number(m.amount).toLocaleString()} RWF</strong></>}</>;
      case "PAYROLL":
        return <>Payroll activity{m.employeeName && <> for <strong>{String(m.employeeName)}</strong></>}</>;
      case "NOTE":
        return <>{m.note ? String(m.note) : "Note added"}</>;
      default:
        return null;
    }
  };

  const renderDetails = (entry: TimelineEntry) => {
    const m = entry.metadata ?? {};
    switch (entry.type) {
      case "TRANSACTION":
        return (
          <>
            <div className="detail-row"><span>Client</span><strong>{String(m.clientName ?? "—")}</strong></div>
            <div className="detail-row"><span>Amount</span><strong>{typeof m.amount === "number" ? `${Number(m.amount).toLocaleString()} RWF` : "—"}</strong></div>
            <div className="detail-row"><span>Payment method</span><strong>{String(m.paymentMethod ?? "—")}</strong></div>
            <div className="detail-row"><span>Discount</span><strong>{typeof m.discount === "number" ? `${Number(m.discount).toLocaleString()} RWF` : "0 RWF"}</strong></div>
            {m.physicianName && <div className="detail-row"><span>Physician</span><strong>{String(m.physicianName)}</strong></div>}
          </>
        );
      case "EXPENSE":
        return (
          <>
            <div className="detail-row"><span>Title</span><strong>{String(m.title ?? "—")}</strong></div>
            <div className="detail-row"><span>Amount</span><strong>{typeof m.amount === "number" ? `${Number(m.amount).toLocaleString()} RWF` : "—"}</strong></div>
            <div className="detail-row"><span>Category</span><strong>{String(m.category ?? "—")}</strong></div>
            {m.notes && <div className="detail-row"><span>Notes</span><strong>{String(m.notes)}</strong></div>}
          </>
        );
      case "PAYROLL":
        return (
          <>
            <div className="detail-row"><span>Employee</span><strong>{String(m.employeeName ?? "—")}</strong></div>
            <div className="detail-row"><span>Month</span><strong>{String(m.month ?? "—")}</strong></div>
            <div className="detail-row"><span>Net payable</span><strong>{typeof m.netPayable === "number" ? `${Number(m.netPayable).toLocaleString()} RWF` : "—"}</strong></div>
            {m.status && <div className="detail-row"><span>Status</span><strong>{String(m.status)}</strong></div>}
          </>
        );
      case "NOTE":
        if (editingNote === entry.id) {
          return (
            <div className="timeline-edit-fields">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                autoFocus
              />
              <div className="timeline-actions">
                <button className="btn-ghost" onClick={() => setEditingNote(null)} disabled={saving}>Cancel</button>
                <button className="btn-primary" onClick={() => handleSaveNote(entry)} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          );
        }
        return (
          <>
            <div className="detail-row"><span>Note</span><strong>{String(m.note ?? "—")}</strong></div>
            {canManage && (
              <div className="timeline-actions">
                <button className="btn-ghost" onClick={() => { setEditingNote(entry.id); setNoteText(String(m.note ?? "")); }}>Edit</button>
                <button className="btn-danger" onClick={() => handleDeleteNote(entry.id)}>Delete</button>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="timeline-loading">Loading timeline...</div>;

  return (
    <div className="timeline-page">
      <div className="timeline-header">
        <div>
          <h2>Daily Timeline</h2>
          <p>Everything that happened today.</p>
        </div>
        <div className="timeline-header-right">
          <div className="timeline-date">{new Date().toLocaleDateString()}</div>
          {canManage && (
            <button className="btn-primary" onClick={() => setShowAddNote((p) => !p)}>
              + Add note
            </button>
          )}
        </div>
      </div>

      {/* Add note form */}
      {showAddNote && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <strong style={{ fontSize: "var(--font-size-base)" }}>Add a note</strong>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note about today's activities..."
            rows={3}
            autoFocus
          />
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => { setShowAddNote(false); setNewNote(""); }}>Cancel</button>
            <button className="btn-primary" onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>
              {addingNote ? "Adding..." : "Add note"}
            </button>
          </div>
        </div>
      )}

      {error && <div className="timeline-error">{error}</div>}

      {entries.length === 0 ? (
        <div className="timeline-empty">
          <h3>No activity yet</h3>
          <p>No events were recorded for today.</p>
        </div>
      ) : (
        <ul className="timeline-list">
          {entries.map((entry) => {
            const expanded = expandedId === entry.id;
            return (
              <li key={entry.id} className={`timeline-entry ${entry.type.toLowerCase()}`}>
                <div className="timeline-marker">
                  <span className="timeline-dot" />
                </div>
                <div
                  className={`timeline-card ${expanded ? "open" : ""}`}
                  onClick={() => setExpandedId((p) => p === entry.id ? null : entry.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedId((p) => p === entry.id ? null : entry.id); } }}
                >
                  <div className="timeline-top">
                    <div className="timeline-top-left">
                      <span className={`timeline-badge ${entry.type.toLowerCase()}`}>{LABELS[entry.type]}</span>
                      {entry.action && <span className="timeline-action">{entry.action}</span>}
                    </div>
                    <span className={`timeline-chevron ${expanded ? "open" : ""}`}>⌄</span>
                  </div>

                  <div className="timeline-message">{getSummary(entry)}</div>

                  {expanded && (
                    <div className="timeline-details" onClick={(e) => e.stopPropagation()}>
                      {renderDetails(entry)}
                    </div>
                  )}

                  <div className="timeline-footer">
                    <div className="timeline-user">
                      <div className="timeline-avatar">
                        {(entry.performedBy?.name ?? "S").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="timeline-user-name">{entry.performedBy?.name ?? "System"}</span>
                        {entry.approvedBy && (
                          <div className="timeline-approved">Approved by {entry.approvedBy.name}</div>
                        )}
                      </div>
                    </div>
                    <time className="timeline-time">
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </time>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DailyTimeline;