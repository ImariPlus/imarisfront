export default function SkeletonExpense() {
  return (
    <div className="expense-item skeleton-expense">
      <div className="skel skel-dot" />
      <div className="expense-item-main">
        <div className="skel skel-line long" />
        <div className="skel skel-line short" />
      </div>
      <div className="skel skel-badge" />
      <div className="skel skel-amount" />
    </div>
  );
}