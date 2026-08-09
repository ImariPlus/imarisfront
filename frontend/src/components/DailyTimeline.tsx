import React, { useEffect, useState } from "react";
import api from "../api";
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

interface DailyTimelineProps {
  date?: string;
}

const LABELS: Record<TimelineEntry["type"], string> = {
  TRANSACTION: "Transaction",
  EXPENSE: "Expense",
  PAYROLL: "Payroll",
  NOTE: "Note",
};

const DailyTimeline: React.FC<DailyTimelineProps> = ({ date }) => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await api.get("/api/timeline", { params: { date } });
        setEntries(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [date]);

  if (loading) {
    return (
      <div className="timeline-loading">
        Loading timeline...
      </div>
    );
  }

  return (
    <div className="timeline-page">

      <div className="timeline-header">
        <div>
          <h2>Daily Timeline</h2>
          <p>Everything that happened on this day.</p>
        </div>

        <div className="timeline-date">
          {date
            ? new Date(date).toLocaleDateString()
            : new Date().toLocaleDateString()}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="timeline-empty">
          <div className="timeline-empty-icon">🕊️</div>
          <h3>No activity found</h3>
          <p>No events were recorded for this day.</p>
        </div>
      ) : (
        <ul className="timeline-list">
          {entries.map((e) => (
            <li
              key={e.id}
              className={`timeline-entry ${e.type.toLowerCase()}`}
            >

              <div className="timeline-marker">
                <span className="timeline-dot" />
              </div>

              <div className="timeline-card">

                <div className="timeline-top">
                  <span className={`timeline-badge ${e.type.toLowerCase()}`}>
                    {LABELS[e.type]}
                  </span>

                  {e.action && (
                    <span className="timeline-action">
                      {e.action}
                    </span>
                  )}
                </div>

                <div className="timeline-message">
                  {e.type === "TRANSACTION" && (
                    <>
                      Received payment
                      {e.metadata?.clientName && (
                        <> from <strong>{String(e.metadata.clientName)}</strong></>
                      )}
                      {typeof e.metadata?.amount === "number" && (
                        <>
                          {" "}for
                          <strong>
                            {" "}
                            {Number(e.metadata.amount).toLocaleString()} RWF
                          </strong>
                        </>
                      )}
                    </>
                  )}

                  {e.type === "EXPENSE" && (
                    <>
                      Expense recorded
                      {e.metadata?.title && (
                        <>: <strong>{String(e.metadata.title)}</strong></>
                      )}
                    </>
                  )}

                  {e.type === "PAYROLL" && (
                    <>
                      Payroll activity
                      {e.metadata?.employeeName && (
                        <> for <strong>{String(e.metadata.employeeName)}</strong></>
                      )}
                    </>
                  )}

                  {e.type === "NOTE" && (
                    <>
                      {e.metadata?.note
                        ? String(e.metadata.note)
                        : "Note added"}
                    </>
                  )}
                </div>

                <div className="timeline-footer">
                  <div className="timeline-user">
                    <div className="timeline-avatar">
                      {(e.performedBy?.name ?? "S")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <span className="timeline-user-name">
                        {e.performedBy?.name ?? "System"}
                      </span>

                      {e.approvedBy && (
                        <div className="timeline-approved">
                          Approved by {e.approvedBy.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <time className="timeline-time">
                    {new Date(e.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DailyTimeline;