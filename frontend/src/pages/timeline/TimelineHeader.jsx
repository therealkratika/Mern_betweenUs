export default function TimelineHeader({ user, onProfile }) {
  return (
    <header className="timeline-header">
      <div className="header-left">
        <div className="lock-circle">🔒</div>
        <div>
          <h3>Your Space</h3>
          <p>
            {user?.name}
            {user?.partnerName ? ` & ${user.partnerName}` : " ❤️"}
          </p>
        </div>
      </div>

      <button className="icon-btn" onClick={onProfile}>
        👤
      </button>
    </header>
  );
}
