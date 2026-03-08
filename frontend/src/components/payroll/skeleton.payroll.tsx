import "../../styles/Payroll.css";

export default function SkeletonPayroll() {
  return (
    <div className="payroll-card skeleton">
      <div className="avatar-progress">
        <div className="skeleton-circle"></div>
      </div>
      <div className="payroll-info">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line long"></div>
      </div>
      <div className="more-btn skeleton-dot"></div>
    </div>
  );
}