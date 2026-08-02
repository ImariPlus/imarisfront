import "../../styles/DashboardSkeleton.css";

const DashboardSkeleton = () => {
  return (
    <div className="dashboard-container">
      <div className="skeleton skeleton-title" />

      {/* STATS GRID */}
      <div className="dashboard-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dashboard-card">
            <div className="skeleton skeleton-text short" />
            <div className="skeleton skeleton-text long" />
          </div>
        ))}
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="dashboard-section">
        <div className="skeleton skeleton-subtitle" />

        <ul className="timeline-preview">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i}>
              <div className="skeleton skeleton-badge" />
              <div className="skeleton skeleton-text medium" />
              <div className="skeleton skeleton-time" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
