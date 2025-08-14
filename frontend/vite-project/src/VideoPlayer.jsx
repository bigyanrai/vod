// import React, { useEffect, useRef } from "react";
// import videojs from "video.js";
// import "video.js/dist/video-js.css";

// const VideoPlayer = ({ src }) => {
//   const videoRef = useRef(null);
//   const playerRef = useRef(null);

//   useEffect(() => {
//     if (!playerRef.current) {
//       playerRef.current = videojs(videoRef.current, {
//         controls: true,
//         fluid: true,
//         preload: "auto",
//       });

//       // HLS support for non-Safari browsers
//       if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
//         playerRef.current.src({ src, type: "application/vnd.apple.mpegurl" });
//       } else {
//         // Hls.js fallback
//         import("hls.js").then((HlsModule) => {
//           const Hls = HlsModule.default;
//           if (Hls.isSupported()) {
//             const hls = new Hls();
//             hls.loadSource(src);
//             hls.attachMedia(videoRef.current);
//           }
//         });
//       }
//     }

//     return () => {
//       if (playerRef.current) {
//         playerRef.current.dispose();
//       }
//     };
//   }, [src]);

//   return (
//     <div>
//       <video ref={videoRef} className="video-js vjs-big-play-centered" />
//     </div>
//   );
// };

// export default VideoPlayer;

// import React, { useEffect, useRef } from "react";
// import videojs from "video.js";
// import "video.js/dist/video-js.css";

// const VideoPlayer = ({ src }) => {
//   const videoRef = useRef(null);
//   const playerRef = useRef(null);

//   useEffect(() => {
//     if (!playerRef.current) {
//       // Initialize Video.js
//       playerRef.current = videojs(videoRef.current, {
//         autoplay: false,
//         controls: true,
//         responsive: true,
//         fluid: true,
//         sources: [
//           {
//             src,
//             type: "application/x-mpegURL", // HLS format
//           },
//         ],
//       });
//     } else {
//       // Update source if src changes
//       playerRef.current.src({ src, type: "application/x-mpegURL" });
//     }

//     return () => {
//       if (playerRef.current) {
//         playerRef.current.dispose();
//         playerRef.current = null;
//       }
//     };
//   }, [src]);

//   return (
//     <div>
//       <div data-vjs-player>
//         <video
//           ref={videoRef}
//           className="video-js vjs-big-play-centered"
//         ></video>
//       </div>
//     </div>
//   );
// };

// export default VideoPlayer;

import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const initializePlayer = () => {
      if (videoRef.current && !playerRef.current) {
        playerRef.current = videojs(videoRef.current, {
          autoplay: false,
          controls: true,
          responsive: true,
          fluid: true,
          sources: [
            {
              src,
              type: "application/x-mpegURL",
            },
          ],
        });
      } else if (playerRef.current) {
        playerRef.current.src({ src, type: "application/x-mpegURL" });
      }
    };

    // Use requestAnimationFrame to ensure the element is in the DOM
    const frame = requestAnimationFrame(initializePlayer);

    return () => {
      cancelAnimationFrame(frame);
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]);

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        playsInline
      />
    </div>
  );
};

export default VideoPlayer;
