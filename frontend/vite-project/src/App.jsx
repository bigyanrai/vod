// import React from "react";
// import VideoPlayer from "./VideoPlayer";

// function App() {
//   const videoUrl =
//     "https://nninesolution.ddns.net/nnine-bucket/courses/6822089b-ea61-49f2-bb96-097c42fbf755/master.m3u8";

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Course Video</h2>
//       <VideoPlayer src={videoUrl} />
//     </div>
//   );
// }

// export default App;

import React from "react";
// import VideoPlayer from "./VideoPlayer";

// function App() {
//   const videoUrl =
//     "https://nninesolution.ddns.net/nnine-bucket/courses/6822089b-ea61-49f2-bb96-097c42fbf755/master.m3u8";

//   return (
//     <div>
//       <h2>HLS Video Player</h2>
//       <VideoPlayer src={videoUrl} />
//     </div>
//   );
// }

// export default App;

// import VideoPlayer from "./VideoPlayer";
// import ReactPlayer from "react-player";

// function App() {
//   // Replace this URL with your actual master.m3u8 VOD URL
//   const videoUrl =
//     "https://nninesolution.ddns.net/nnine-bucket/courses/6822089b-ea61-49f2-bb96-097c42fbf755/master.m3u8";

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>VOD Streaming Example</h2>
//       <VideoPlayer src={videoUrl} />
//     </div>
//   );
// }

// export default App;

import HlsVideoPlayer from "./VideoPlayer";

function App() {
  const videoUrl =
    "https://nninesolution.ddns.net/nnine-bucket/courses/9b7bd745-7081-4cf2-a650-2e9fd2e72749/master.m3u8";

  return (
    <div>
      <h2>HLS Video Player</h2>
      <HlsVideoPlayer src={videoUrl} />
    </div>
  );
}

export default App;
