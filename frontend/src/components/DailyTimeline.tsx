import React, { useEffect, useState } from "react";
import api from "../api";
import "../styles/DailyTimeline.css";

interface TimelineEntry {
  id: string;
  description: string;
  type: "TRANSACTION" | "EXPENSE" | "PAYROLL" | "NOTE";
  createdAt: string;
  user: { id: string; name: string };
}

interface DailyTimelineProps {
  date?: string;
}

const DailyTimeline: React.FC<DailyTimelineProps> = ({ date }) => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await api.get("/api/timeline", { params: { date } });
        setEntries(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [date]);

  if (loading) return <p>Loading timeline...</p>;

  return (
    <div className="timeline-container">
      {entries.length === 0 && <p>No events for this day.</p>}
      <ul>
        {entries.map((e) => (
          <li key={e.id} className={`timeline-entry ${e.type.toLowerCase()}`}>
            <span className="badge">{e.type}</span>
            <span className="description">{e.description}</span>
            <span className="user">{e.user.name}</span>
            <span className="time">{new Date(e.createdAt).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DailyTimeline;
