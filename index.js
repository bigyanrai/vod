// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import { v4 as uuidv4 } from "uuid";
// import path from "path";
// import fs from "fs";
// import { exec } from "child_process";
// import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

// const app = express();

// // Set FFmpeg path from the installer
// process.env.FFMPEG_PATH = ffmpegInstaller.path;

// // multer middleware
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:5173"],
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   next();
// });
// app.use("/uploads", express.static("uploads"));

// app.get("/", function (req, res) {
//   res.json({ message: "Hello bigyan" });
// });

// app.post("/upload", upload.single("file"), (req, res) => {
//   const lessonId = uuidv4();
//   const videoPath = req.file.path;
//   const outputPath = path.join("./uploads", "courses", lessonId);
//   const hlsPath = path.join(outputPath, "index.m3u8");

//   // Create directory
//   try {
//     fs.mkdirSync(outputPath, { recursive: true });
//   } catch (err) {
//     return res.status(500).json({ error: "Failed to create output directory" });
//   }

//   // FFmpeg command using the installed path
//   const ffmpegCommand =
//     `${ffmpegInstaller.path} -i "${videoPath}" -codec:v libx264 -codec:a aac ` +
//     `-hls_time 10 -hls_playlist_type vod ` +
//     `-hls_segment_filename "${path.join(outputPath, "segment%03d.ts")}" ` +
//     `-start_number 0 "${hlsPath}"`;

//   exec(ffmpegCommand, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`FFmpeg failed: ${stderr}`);
//       return res.status(500).json({
//         error: "Video conversion failed",
//         details: stderr,
//       });
//     }

//     // Verify output
//     try {
//       const files = fs.readdirSync(outputPath);
//       if (
//         !files.some((f) => f.endsWith(".ts")) ||
//         !files.includes("index.m3u8")
//       ) {
//         throw new Error("HLS files not generated");
//       }

//       res.json({
//         message: "Conversion successful",
//         videoUrl: `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`,
//         lessonId,
//       });
//     } catch (verifyErr) {
//       console.error("Output verification failed:", verifyErr);
//       res.status(500).json({ error: "Output verification failed" });
//     }
//   });
// });

// app.listen(8000, function () {
//   console.log("Server is running on port 8000");
// });

// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import { v4 as uuidv4 } from "uuid";
// import path from "path";
// import fs from "fs";
// import ffmpeg from "fluent-ffmpeg";

// const app = express();

// // Multer middleware
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:5173"],
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   next();
// });
// app.use("/uploads", express.static("uploads"));

// app.get("/", function (req, res) {
//   res.json({ message: "Hello bigyan" });
// });

// app.post("/upload", upload.single("file"), (req, res) => {
//   const lessonId = uuidv4();
//   const videoPath = req.file.path;
//   const outputPath = `./uploads/courses/${lessonId}`;
//   const hlsPath = `${outputPath}/index.m3u8`;

//   if (!fs.existsSync(outputPath)) {
//     fs.mkdirSync(outputPath, { recursive: true });
//   }

//   ffmpeg(videoPath)
//     .videoCodec("libx264")
//     .audioCodec("aac")
//     .outputOptions([
//       "-hls_time 10",
//       "-hls_playlist_type vod",
//       `-hls_segment_filename ${outputPath}/segment%03d.ts`,
//       "-start_number 0",
//     ])
//     .save(hlsPath)
//     .on("end", () => {
//       console.log("HLS conversion complete!");
//       const videoUrl = `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`;
//       res.json({
//         message: "File uploaded and converted successfully",
//         videoUrl: videoUrl,
//         lessonId: lessonId,
//       });
//     })
//     .on("error", (err) => {
//       console.error("Error:", err);
//       res.status(500).json({ error: "Video conversion failed" });
//     });
// });

// app.listen(8000, function () {
//   console.log("Server is running on port 8000");
// });

// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import { v4 as uuidv4 } from "uuid";
// import path from "path";
// import fs from "fs";
// import { exec } from "child_process";
// import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

// const app = express();

// // Set FFmpeg path from the installer
// process.env.FFMPEG_PATH = ffmpegInstaller.path;

// // multer middleware
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:5173"],
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   next();
// });
// app.use("/uploads", express.static("uploads"));

// app.get("/", function (req, res) {
//   res.json({ message: "Hello bigyan" });
// });

// app.post("/upload", upload.single("file"), (req, res) => {
//   const lessonId = uuidv4();
//   const videoPath = req.file.path;
//   const outputPath = path.join("./uploads", "courses", lessonId);
//   const hlsPath = path.join(outputPath, "index.m3u8");

//   // Create directory
//   try {
//     fs.mkdirSync(outputPath, { recursive: true });
//   } catch (err) {
//     return res.status(500).json({ error: "Failed to create output directory" });
//   }

//   // FFmpeg command using the installed path
//   const ffmpegCommand =
//     `${ffmpegInstaller.path} -i "${videoPath}" -codec:v libx264 -codec:a aac ` +
//     `-hls_time 10 -hls_playlist_type vod ` +
//     `-hls_segment_filename "${path.join(outputPath, "segment%03d.ts")}" ` +
//     `-start_number 0 "${hlsPath}"`;

//   exec(ffmpegCommand, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`FFmpeg failed: ${stderr}`);
//       return res.status(500).json({
//         error: "Video conversion failed",
//         details: stderr,
//       });
//     }

//     // Verify output
//     try {
//       const files = fs.readdirSync(outputPath);
//       if (
//         !files.some((f) => f.endsWith(".ts")) ||
//         !files.includes("index.m3u8")
//       ) {
//         throw new Error("HLS files not generated");
//       }

//       res.json({
//         message: "Conversion successful",
//         videoUrl: `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`,
//         lessonId,
//       });
//     } catch (verifyErr) {
//       console.error("Output verification failed:", verifyErr);
//       res.status(500).json({ error: "Output verification failed" });
//     }
//   });
// });

// app.listen(8000, function () {
//   console.log("Server is running on port 8000");
// });

// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import { v4 as uuidv4 } from "uuid";
// import path from "path";
// import fs from "fs";
// import { Queue } from "bullmq";
// import IORedis from "ioredis";

// const app = express();
// const connection = new IORedis();

// // BullMQ queue
// const videoQueue = new Queue("video-processing", { connection });

// // Multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:5173"],
//     credentials: true,
//   })
// );
// app.use(express.json());
// app.use("/uploads", express.static("uploads"));

// // Test route
// app.get("/", (req, res) => {
//   res.json({ message: "Hello Bigyan" });
// });

// // Upload + queue job
// app.post("/upload", upload.single("file"), async (req, res) => {
//   const lessonId = uuidv4();
//   const videoPath = req.file.path;

//   fs.mkdirSync("./uploads/courses", { recursive: true });

//   await videoQueue.add("process-video", { lessonId, videoPath });

//   res.json({
//     message: "Upload successful, video processing started",
//     lessonId,
//   });
// });

// app.listen(8000, () => {
//   console.log("Server is running on port 8000");
// });

import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import Agenda from "agenda";

const app = express();

// MongoDB connection for Agenda
const mongoConnectionString = "mongodb://127.0.0.1:27017/agenda";
const agenda = new Agenda({ db: { address: mongoConnectionString } });

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

// Multer storage
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + uuidv4() + ".mp4");
  },
});
const upload = multer({ storage });

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Hello Bigyan" });
});

// Upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  const lessonId = uuidv4();

  // Schedule job immediately
  await agenda.now("transcode-video", { filePath: req.file.path, lessonId });

  res.json({
    lessonId,
    message: "Upload successful, video processing started",
  });
});

// Start server
app.listen(8000, async () => {
  await agenda.start(); // Start Agenda inside server so jobs can run
  console.log("Server running on port 8000");
});
