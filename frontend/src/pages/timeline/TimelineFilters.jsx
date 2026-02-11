export default function TimelineFilters({
  emotions,
  years,
  filterEmotion,
  filterYear,
  setFilterEmotion,
  setFilterYear,
}) {
  return (
    <div className="filters">
      <div className="filter-group">
        <button
          className={filterEmotion === "all" ? "filter active" : "filter"}
          onClick={() => setFilterEmotion("all")}
        >
          All
        </button>

        {emotions.map((emo) => (
  <button
    key={emo.value}
    className={filterEmotion === emo.value ? "filter active" : "filter"}
    onClick={() => setFilterEmotion(emo.value)}
  >
    <img src={emo.icon} className="emotion-icon" alt={emo.label} />
    {emo.label}
  </button>
))}


      </div>

      <div className="divider" />

      <div className="filter-group">
        {years.map((year) => (
          <button
            key={year}
            className={filterYear === year ? "filter active" : "filter"}
            onClick={() => setFilterYear(year)}
          >
            {year === "all" ? "All" : year}
          </button>
        ))}
      </div>
    </div>
  );
}
