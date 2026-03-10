import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOnThisDay } from "../api/memories";

export default function OnThisDay() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getOnThisDay();
        console.log("ON THIS DAY RESPONSE 👉", res); // 👈 IMPORTANT
        setData(res);
      } catch (err) {
        console.error("ON THIS DAY ERROR ❌", err);
        setError("Failed to load memories");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="status">Looking back… ✨</div>;
  if (error) return <div className="status error">{error}</div>;
  if (!data) return <div className="status">No data found</div>;

  const renderMemory = (m) => (
    <div
      key={m._id}
      className="otd-card"
      onClick={() => navigate(`/day/${m._id}`)}
    >
      <img
        src={m.photos?.[m.coverPhotoIndex]?.url}
        alt=""
      />
      <div>
        <p className="date">
          {new Date(m.date).toDateString()}
        </p>
        <p className="caption">{m.caption}</p>
      </div>
    </div>
  );

  return (
    <div className="otd-wrapper">
      <h2>📅 On This Day</h2>

      <section>
        <h3>💫 Same day in past years</h3>
        {data.sameDay?.length === 0 ? (
          <p>No memories for this date yet</p>
        ) : (
          data.sameDay?.map(renderMemory)
        )}
      </section>

      <section>
        <h3>⏪ Recent memories</h3>
        {data.recent?.map(renderMemory)}
      </section>
    </div>
  );
}