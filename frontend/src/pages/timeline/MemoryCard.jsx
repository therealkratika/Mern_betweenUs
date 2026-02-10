import {EMOTIONS} from "../../../utils/Emotion.js";

export default function MemoryCard({ memory, onClick }) {
  return (
    <div className="memory-card" onClick={onClick}>
      {memory.coverPhoto ? (
        <img src={memory.coverPhoto} alt="cover" />
      ) : (
        <div className="image-placeholder">📷</div>
      )}

      <div className="memory-body">
        <div className="memory-top">
          <span className="date">
            {new Date(memory.date).toDateString()}
          </span>
          <span className="emotion">
            {EMOTIONS[memory.emotion]?.emoji || "💭"}
          </span>
        </div>

        <p className="caption">{memory.caption}</p>

        <span className="count">{memory.photoCount} photos</span>
      </div>
    </div>
  );
}
