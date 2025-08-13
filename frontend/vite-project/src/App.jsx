import "./App.css";
import { useRef } from "react";
import VideoPlayer from "./VideoPlayer";
import videojs from "video.js";

function App() {
  const playerRef = useRef(null);
  const videoLink =
    "http://localhost:8000/uploads/courses/1f0a52f4-5eca-4f0a-b8ff-b0969c10c875/index.m3u8";

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };
  const videoPlayerOptions = {
    autoplay: true,
    controls: true,
    sources: [
      {
        src: videoLink,
        type: "application/x-mpegURL",
      },
    ],
  };

  return (
    <div>
      <h1>Video Player</h1>
      <VideoPlayer
        ref={playerRef}
        options={videoPlayerOptions}
        onReady={handlePlayerReady}
      />
    </div>
  );
}

export default App;
