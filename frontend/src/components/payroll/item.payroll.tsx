import "../../styles/Payroll.css";

interface User {
  photo: string;
  name: string;
}

interface Payroll {
  savedAmount?: number;
  netPayable?: number;
  user: User;
}

type Props = {
  payroll: Payroll;
};

export default function ItemPayroll({ payroll }: Props) {
  const saved = payroll.savedAmount || 0;
  const total = payroll.netPayable || 0;
  const percent = total === 0 ? 0 : saved / total;

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - percent * circumference;

  return (
    <div className="payroll-card">
      <div className="avatar-progress">
        <svg className="progress-ring" width="120" height="120">
          {/* Gradient for the progress ring */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00c6ff" />
              <stop offset="100%" stopColor="#0072ff" />
            </linearGradient>
          </defs>

          {/* background ring */}
          <circle
            className="ring-bg"
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            strokeWidth="8"
          />

          {/* progress ring */}
          <circle
            className="ring-progress"
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="url(#progressGradient)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </svg>

        <img
          src={payroll.user.photo}
          alt={payroll.user.name}
          className="avatar-img"
        />
      </div>

      <div className="payroll-info">
        <h4>{payroll.user.name}</h4>

        <p>
          {saved.toLocaleString()} / {total.toLocaleString()}
        </p>

        <span className="saved-label">saved</span>
      </div>

      <button className="more-btn">•••</button>
    </div>
  );
}