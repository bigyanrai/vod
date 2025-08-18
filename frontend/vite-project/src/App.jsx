import { BrowserRouter, Route, Routes } from "react-router-dom";
import Video from "./page/video";
import CourseProgressSteps from "./page/Progress";

function App() {
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
