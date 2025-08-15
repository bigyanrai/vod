// import React, { useEffect, useRef } from "react";
// import videojs from "video.js";
// import "video.js/dist/video-js.css";

// const VideoPlayer = ({ src }) => {
//   const videoRef = useRef(null);
//   const playerRef = useRef(null);

//   useEffect(() => {
//     const initializePlayer = () => {
//       if (videoRef.current && !playerRef.current) {
//         playerRef.current = videojs(videoRef.current, {
//           autoplay: false,
//           controls: true,
//           responsive: true,
//           fluid: true,
//           sources: [
//             {
//               src,
//               type: "application/x-mpegURL",
//             },
//           ],
//         });
//       } else if (playerRef.current) {
//         playerRef.current.src({ src, type: "application/x-mpegURL" });
//       }
//     };

//     // Use requestAnimationFrame to ensure the element is in the DOM
//     const frame = requestAnimationFrame(initializePlayer);

//     return () => {
//       cancelAnimationFrame(frame);
//       if (playerRef.current) {
//         playerRef.current.dispose();
//         playerRef.current = null;
//       }
//     };
//   }, [src]);

//   return (
//     <div data-vjs-player>
//       <video
//         ref={videoRef}
//         className="video-js vjs-big-play-centered"
//         playsInline
//       />
//     </div>
//   );
// };

// export default VideoPlayer;

// import React, { useEffect, useRef, useState } from "react";
// import videojs from "video.js";
// import "video.js/dist/video-js.css";

// const VideoPlayer = ({ src }) => {
//   const videoRef = useRef(null);
//   const playerRef = useRef(null);
//   const [levels, setLevels] = useState([]);
//   const [currentLevel, setCurrentLevel] = useState("auto");

//   useEffect(() => {
//     const initializePlayer = () => {
//       if (videoRef.current && !playerRef.current) {
//         const player = videojs(videoRef.current, {
//           autoplay: false,
//           controls: true,
//           responsive: true,
//           fluid: true,
//           sources: [{ src, type: "application/x-mpegURL" }],
//         });

//         playerRef.current = player;

//         player.ready(() => {
//           const hls = player.tech().hls;
//           if (hls && hls.levels) {
//             setLevels(hls.levels.map((l) => l.height).filter(Boolean));
//           }
//         });

//         // Listen to quality change
//         player.on("levelswitched", () => {
//           const hls = player.tech().hls;
//           if (hls) {
//             const level = hls.currentLevel;
//             setCurrentLevel(level === -1 ? "auto" : hls.levels[level].height);
//           }
//         });
//       } else if (playerRef.current) {
//         playerRef.current.src({ src, type: "application/x-mpegURL" });
//       }
//     };

//     const frame = requestAnimationFrame(initializePlayer);

//     return () => {
//       cancelAnimationFrame(frame);
//       if (playerRef.current) {
//         playerRef.current.dispose();
//         playerRef.current = null;
//       }
//     };
//   }, [src]);

//   const handleQualityChange = (height) => {
//     const player = playerRef.current;
//     const hls = player.tech().hls;
//     if (!hls) return;

//     if (height === "auto") {
//       hls.currentLevel = -1; // Auto
//     } else {
//       const levelIndex = hls.levels.findIndex((l) => l.height === height);
//       if (levelIndex !== -1) hls.currentLevel = levelIndex;
//     }

//     setCurrentLevel(height);
//   };

//   return (
//     <div>
//       <div data-vjs-player>
//         <video
//           ref={videoRef}
//           className="video-js vjs-big-play-centered"
//           playsInline
//         />
//       </div>

//       {/* Quality selector UI */}
//       {levels.length > 0 && (
//         <div style={{ marginTop: 8 }}>
//           <span>Quality: </span>
//           <select
//             value={currentLevel}
//             onChange={(e) => handleQualityChange(e.target.value)}
//           >
//             <option value="auto">Auto</option>
//             {levels.map((h) => (
//               <option key={h} value={h}>
//                 {h}p
//               </option>
//             ))}
//           </select>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoPlayer;





//this one works but it dosen't have quality control

// import React, { useEffect, useRef, useState } from "react";
// import Hls from "hls.js";

// const HlsVideoPlayer = ({ src }) => {
//   const videoRef = useRef(null);
//   const hlsRef = useRef(null);
//   const [levels, setLevels] = useState([]);
//   const [currentLevel, setCurrentLevel] = useState("auto");

//   useEffect(() => {
//     const video = videoRef.current;

//     if (Hls.isSupported()) {
//       const hls = new Hls({ autoStartLoad: true });
//       hlsRef.current = hls;

//       hls.loadSource(src);
//       hls.attachMedia(video);

//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         // Populate available quality levels
//         const qualityLevels = hls.levels.map((l) => l.height).filter(Boolean);
//         setLevels(qualityLevels);
//       });

//       hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
//         setCurrentLevel(
//           data.level === -1 ? "auto" : hls.levels[data.level].height
//         );
//       });

//       hls.on(Hls.Events.ERROR, (_, data) => {
//         console.error("HLS.js error:", data);
//       });
//     } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//       // Fallback for Safari
//       video.src = src;
//     }

//     return () => {
//       if (hlsRef.current) {
//         hlsRef.current.destroy();
//         hlsRef.current = null;
//       }
//     };
//   }, [src]);

//   const handleQualityChange = (height) => {
//     const hls = hlsRef.current;
//     if (!hls) return;

//     if (height === "auto") {
//       hls.currentLevel = -1; // automatic
//     } else {
//       const levelIndex = hls.levels.findIndex((l) => l.height === height);
//       if (levelIndex !== -1) hls.currentLevel = levelIndex;
//     }

//     setCurrentLevel(height);
//   };

//   return (
//     <div>
//       <video
//         ref={videoRef}
//         controls
//         style={{ width: "100%", maxHeight: "500px" }}
//         playsInline
//       />

//       {levels.length > 0 && (
//         <div style={{ marginTop: 8 }}>
//           <span>Quality: </span>
//           <select
//             value={currentLevel}
//             onChange={(e) => handleQualityChange(e.target.value)}
//           >
//             <option value="auto">Auto</option>
//             {levels.map((h) => (
//               <option key={h} value={h}>
//                 {h}p
//               </option>
//             ))}
//           </select>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HlsVideoPlayer;


// this one have quality control but the container is not  fixed
// import React, { useEffect, useRef, useState } from "react";
// import Hls from "hls.js";

// const HlsVideoPlayer = ({ src }) => {
//   const videoRef = useRef(null);
//   const hlsRef = useRef(null);
//   const [levels, setLevels] = useState([]);
//   const [currentLevel, setCurrentLevel] = useState("auto");

//   useEffect(() => {
//     const video = videoRef.current;

//     if (Hls.isSupported()) {
//       const hls = new Hls({ autoStartLoad: true });
//       hlsRef.current = hls;

//       hls.loadSource(src);
//       hls.attachMedia(video);

//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         // Get unique quality levels and sort descending
//         const qualityLevels = [
//           ...new Set(hls.levels.map((l) => l.height).filter(Boolean)),
//         ].sort((a, b) => b - a);

//         setLevels(qualityLevels);
//       });

//       hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
//         const levelHeight = data.level === -1 ? "auto" : hls.levels[data.level].height;
//         setCurrentLevel(levelHeight);
//       });

//       hls.on(Hls.Events.ERROR, (_, data) => {
//         console.error("HLS.js error:", data);
//       });
//     } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//       // Fallback for Safari
//       video.src = src;
//     }

//     return () => {
//       if (hlsRef.current) {
//         hlsRef.current.destroy();
//         hlsRef.current = null;
//       }
//     };
//   }, [src]);

//   const handleQualityChange = (value) => {
//     const hls = hlsRef.current;
//     if (!hls) return;

//     if (value === "auto") {
//       hls.currentLevel = -1; // automatic
//       setCurrentLevel("auto");
//     } else {
//       const numValue = parseInt(value, 10);
//       const levelIndex = hls.levels.findIndex((l) => l.height === numValue);
//       if (levelIndex !== -1) {
//         hls.currentLevel = levelIndex;
//         setCurrentLevel(numValue);
//       }
//     }
//   };

//   return (
//     <div>
//       <video
//         ref={videoRef}
//         controls
//         style={{ width: "100%", maxHeight: "500px" }}
//         playsInline
//       />

//       {levels.length > 0 && (
//         <div style={{ marginTop: 8 }}>
//           <span>Quality: </span>
//           <select
//             value={currentLevel}
//             onChange={(e) => handleQualityChange(e.target.value)}
//           >
//             <option value="auto">Auto</option>
//             {levels.map((h) => (
//               <option key={h} value={h}>
//                 {h}p
//               </option>
//             ))}
//           </select>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HlsVideoPlayer;



import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const HlsVideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState("auto");

  useEffect(() => {
    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({ autoStartLoad: true });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const qualityLevels = [
          ...new Set(hls.levels.map((l) => l.height).filter(Boolean)),
        ].sort((a, b) => b - a);

        setLevels(qualityLevels);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const levelHeight = data.level === -1 ? "auto" : hls.levels[data.level].height;
        setCurrentLevel(levelHeight);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error("HLS.js error:", data);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  const handleQualityChange = (value) => {
    const hls = hlsRef.current;
    if (!hls) return;

    if (value === "auto") {
      hls.currentLevel = -1;
      setCurrentLevel("auto");
    } else {
      const numValue = parseInt(value, 10);
      const levelIndex = hls.levels.findIndex((l) => l.height === numValue);
      if (levelIndex !== -1) {
        hls.currentLevel = levelIndex;
        setCurrentLevel(numValue);
      }
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        controls
        style={{
          width: "800px",       // fixed width
          height: "450px",      // fixed height (16:9 ratio)
          objectFit: "contain", // keep video aspect ratio
          backgroundColor: "black",
        }}
        playsInline
      />

      {levels.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <span>Quality: </span>
          <select
            value={currentLevel}
            onChange={(e) => handleQualityChange(e.target.value)}
          >
            <option value="auto">Auto</option>
            {levels.map((h) => (
              <option key={h} value={h}>
                {h}p
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default HlsVideoPlayer;
