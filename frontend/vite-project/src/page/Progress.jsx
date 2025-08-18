// CourseUploadProgress.jsx
import React, { useEffect, useState } from "react";

const stages = [
  { key: "transcoding", label: "Transcoding video" },
  { key: "uploading", label: "Uploading to MinIO" },
  { key: "cleanup", label: "Cleaning local files" },
];

const CourseUploadProgress = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [lessonId, setLessonId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("pending");
  const [uploading, setUploading] = useState(false);

  // Track last progress to prevent backward jumps
  const [lastProgress, setLastProgress] = useState(0);

  // Handle file selection
  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!videoFile) return;
    const formData = new FormData();
    formData.append("file", videoFile);

    try {
      setUploading(true);
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log(data);
      if (data.lessonId) {
        setLessonId(data.lessonId);
        setProgress(0);
        setLastProgress(0);
        setCurrentStage("transcoding");
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  // Poll progress if lessonId is available
  useEffect(() => {
    if (!lessonId) return;

    const fetchProgress = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/courses/${lessonId}/progress`);
        const data = await res.json();
        const newProgress = data.progress || 0;

        // Ensure progress never decreases
        const safeProgress = Math.max(newProgress, lastProgress);
        setProgress(safeProgress);
        setLastProgress(safeProgress);

        setCurrentStage(data.stage || "pending");
      } catch (err) {
        console.error("Failed to fetch progress:", err);
      }
    };

    const interval = setInterval(fetchProgress, 2000);
    fetchProgress(); // initial call
    return () => clearInterval(interval);
  }, [lessonId, lastProgress]);

  return (
    <div style={{ maxWidth: "500px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <h2>Upload Video & Track Progress</h2>

      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={uploading || !videoFile}
        style={{ marginLeft: "10px" }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {lessonId && (
        <>
          <div
            style={{
              width: "100%",
              background: "#eee",
              borderRadius: "8px",
              overflow: "hidden",
              margin: "20px 0",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "24px",
                background: "#4caf50",
                textAlign: "center",
                color: "white",
                lineHeight: "24px",
                transition: "width 0.3s",
              }}
            >
              {Math.round(progress)}%
            </div>
          </div>

          <ul style={{ listStyle: "none", padding: 0 }}>
            {stages.map((stage) => {
              const done =
                progress >= 100 ||
                (stage.key === "cleanup" && progress >= 90) ||
                currentStage === stage.key;
              return (
                <li
                  key={stage.key}
                  style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "24px",
                      height: "24px",
                      lineHeight: "24px",
                      borderRadius: "50%",
                      textAlign: "center",
                      marginRight: "10px",
                      background: done ? "#4caf50" : "#ccc",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {done ? "✔" : "⏳"}
                  </span>
                  <span>{stage.label}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default CourseUploadProgress;
