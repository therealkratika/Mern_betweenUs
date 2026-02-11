import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./addDay.css";
import { secureUpload } from "../api/upload";
import { addDayMemory } from "../api/memories";
import { EMOTIONS } from "../../utils/Emotion.js";
export default function AddDay() {
  const navigate = useNavigate();

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [photos, setPhotos] = useState([]);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [emotion, setEmotion] = useState("love");
  const [saving, setSaving] = useState(false);
  
  const handlePhotoUpload = (e) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...selected]);
    e.target.value = "";
  };
console.log({
  date,
  caption,
  emotion,
  coverPhotoIndex,
  photos
});


  const removePhoto = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    if (coverPhotoIndex >= updated.length) {
      setCoverPhotoIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (photos.length === 0) {
      alert("Please add at least one photo");
      return;
    }

    try {
  setSaving(true);

  const uploads = await Promise.all(
    photos.map((file) => secureUpload(file))
  );

  // Extract URL if upload returns object
  const photoUrls = uploads.map((upload) =>
    typeof upload === "string" ? upload : upload.url
  );

  await addDayMemory({
    date,
    caption,
    emotion,
    coverPhotoIndex,
    photos: photoUrls
  });

  navigate("/timeline");
} catch (err) {
  console.error(err);
  alert("Failed to save memory");
} finally {
  setSaving(false);
}

  };

  return (
    <div className="addday-wrapper">
      <div className="addday-card">
        <div className="addday-header">
          <h2>Add a Memory</h2>
          <button className="icon-btn" onClick={() => navigate("/timeline")}>
            ✖
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Date */}
          <div className="field">
            <label>When was this?</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Photos */}
          <div className="field">
            <label>Photos</label>

            {photos.length === 0 ? (
              <label className="upload-box">
                ⬆
                <p>Click to upload photos</p>
                <span>You can select multiple</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  hidden
                  onChange={handlePhotoUpload}
                />
              </label>
            ) : (
              <>
                <div className="photo-grid">
                  {photos.map((photo, index) => (
                    <div className="photo-item" key={index}>
                      <img src={URL.createObjectURL(photo)} alt="memory" />
                      {coverPhotoIndex === index && (
                        <div className="cover-badge">⭐ Cover</div>
                      )}
                      <div className="photo-actions">
                        <button type="button" onClick={() => setCoverPhotoIndex(index)}>⭐</button>
                        <button type="button" onClick={() => removePhoto(index)}>✖</button>
                      </div>
                    </div>
                  ))}
                </div>

                <label className="add-more">
                  ⬆ Add more photos
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    hidden
                    onChange={handlePhotoUpload}
                  />
                </label>
              </>
            )}
          </div>

          {/* Emotion */}
          <div className="field">
            <label>How did this day feel?</label>
            <div className="emotion-row">
  {EMOTIONS.map((emo) => (
  <button
    key={emo.value}
    type="button"
    className={emotion === emo.value ? "emotion active" : "emotion"}
    onClick={() => setEmotion(emo.value)}
  >
    <img src={emo.icon} className="emotion-icon" alt={emo.label} />
    {emo.label}
  </button>
))}
</div>

          </div>
          <div className="field">
            <label>Capture the moment</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
            />
          </div>

          {/* Actions */}
          <div className="actions">
            <button type="button" onClick={() => navigate("/timeline")} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save This Day"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
