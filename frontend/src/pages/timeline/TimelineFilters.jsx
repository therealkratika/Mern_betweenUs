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

        {Object.entries(emotions).map(([key, value]) => (
          <button
            key={key}
            className={filterEmotion === key ? "filter active" : "filter"}
            onClick={() => setFilterEmotion(key)}
            title={value.label}
          >
            {value.emoji}
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
