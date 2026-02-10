export default function EmptyState({ onAdd }) {
  return (
    <div className="empty-state">
      ✨
      <h3>Start capturing moments</h3>
      <p>Your timeline is empty. Add your first memory.</p>
      <button className="primary-btn" onClick={onAdd}>
        + Add First Memory
      </button>
    </div>
  );
}
