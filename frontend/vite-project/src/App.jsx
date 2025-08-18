import { BrowserRouter, Route, Routes } from "react-router-dom";
import Video from "./page/video";
import CourseProgressSteps from "./page/Progress";

function App() {
  const videoUrl =
    "https://nninesolution.ddns.net/nnine-bucket/courses/07adf412-74ca-461a-9877-f672291a2304/master.m3u8";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Video />} />
        <Route path="/progress" element={<CourseProgressSteps />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
