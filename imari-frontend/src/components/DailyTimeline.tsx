import React, { useState } from "react";
import "../Styles/DailyTimeline.css";

interface TimelineEntry {
  time: string;
  task: string;
  completed: boolean;
}

const DailyTimeline: React.FC = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [newTask, setNewTask] = useState("");

  const handleAddTask = () => {
    if (newTask.trim() === "") return;
    setEntries((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString(), task: newTask, completed: false },
    ]);
    setNewTask("");
  };

  const toggleComplete = (index: number) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, completed: !entry.completed } : entry
      )
    );
  };

  return (
    <div className="timeline-container">
      <h2>Daily Timeline</h2>
      <div className="timeline-input">
        <input
          type="text"
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={handleAddTask}>Add</button>
      </div>

      <ul className="timeline-list">
        {entries.map((entry, index) => (
          <li
            key={index}
            className={`timeline-entry ${entry.completed ? "completed" : ""}`}
            onClick={() => toggleComplete(index)}
          >
            <span className="time">{entry.time}</span>
            <span className="task">{entry.task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DailyTimeline;
