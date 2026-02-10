export default function QuickActions({ navigate }) {
  return (
    <div className="quick-actions">
      <div
        className="quick-card"
        role="button"
        tabIndex={0}
        onClick={() => navigate("/letters")}
      >
        💌 <span>Letters</span>
      </div>

      <div
        className="quick-card"
        role="button"
        tabIndex={0}
        onClick={() => navigate("/on-this-day")}
      >
        📅 <span>On This Day</span>
      </div>
    </div>
  );
}
