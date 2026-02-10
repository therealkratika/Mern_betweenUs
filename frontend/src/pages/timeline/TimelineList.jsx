import MemoryCard from "./MemoryCard";

export default function TimelineList({ memories, onOpen }) {
  return (
    <div className="timeline-list">
      {memories.map((memory, index) => (
        <div key={memory.id} className="timeline-item">
          <div className="dot" />
          {index < memories.length - 1 && <div className="line" />}

          <MemoryCard memory={memory} onClick={() => onOpen(memory)} />
        </div>
      ))}
    </div>
  );
}
