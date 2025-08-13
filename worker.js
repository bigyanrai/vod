// import { Worker } from "bullmq";
// import IORedis from "ioredis";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
// import path from "path";
// import fs from "fs";
// import { Client as MinioClient } from "minio";

// const connection = new IORedis();

// // MinIO config
// const minioClient = new MinioClient({
//   endPoint: "127.0.0.1", // MinIO host
//   port: 9000, // MinIO port
//   useSSL: false,
//   accessKey: "minioadmin",
//   secretKey: "minioadmin",
// });

// const bucketName = "videos";

// // Ensure bucket exists
// async function ensureBucket() {
//   const exists = await minioClient.bucketExists(bucketName).catch(() => false);
//   if (!exists) {
//     await minioClient.makeBucket(bucketName);
//     console.log(`✅ Bucket "${bucketName}" created`);
//   }
// }
// await ensureBucket();

// // Upload folder to MinIO
// async function uploadFolderToMinIO(localDir, remoteDir) {
//   const files = fs.readdirSync(localDir);
//   for (const file of files) {
//     const filePath = path.join(localDir, file);
//     const remotePath = path.join(remoteDir, file).replace(/\\/g, "/"); // Windows fix
//     await minioClient.fPutObject(bucketName, remotePath, filePath);
//     console.log(`📤 Uploaded: ${remotePath}`);
//   }
// }

// // Delete local folder
// function deleteLocalFolder(folderPath) {
//   if (fs.existsSync(folderPath)) {
//     fs.rmSync(folderPath, { recursive: true, force: true });
//     console.log(`🗑️ Deleted local folder: ${folderPath}`);
//   }
// }

// // Worker to process videos
// new Worker(
//   "video-processing",
//   async (job) => {
//     const { lessonId, videoPath } = job.data;
//     const outputPath = path.join("./uploads", "courses", lessonId);
//     const hlsPath = path.join(outputPath, "index.m3u8");

//     fs.mkdirSync(outputPath, { recursive: true });
//     console.log(`🎬 Processing video for lesson: ${lessonId}`);

//     await new Promise((resolve, reject) => {
//       ffmpeg(videoPath)
//         .setFfmpegPath(ffmpegInstaller.path)
//         .videoCodec("libx264")
//         .audioCodec("aac")
//         .outputOptions([
//           "-hls_time 10",
//           "-hls_playlist_type vod",
//           `-hls_segment_filename ${path.join(outputPath, "segment%03d.ts")}`,
//         ])
//         .output(hlsPath)
//         .on("end", () => {
//           console.log(`✅ Video processed successfully: ${lessonId}`);
//           resolve();
//         })
//         .on("error", (err) => {
//           console.error("❌ FFmpeg error:", err);
//           reject(err);
//         })
//         .run();
//     });

//     // Upload to MinIO
//     await uploadFolderToMinIO(outputPath, `courses/${lessonId}`);

//     // Delete local files
//     deleteLocalFolder(outputPath);

//     console.log(`🏁 Job complete for lesson: ${lessonId}`);
//   },
//   { connection }
// );

// console.log("🚀 Worker is listening for video-processing jobs...");

import Agenda from "agenda";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import { Client as MinioClient } from "minio";

const mongoConnectionString = "mongodb://127.0.0.1:27017/agenda";
const agenda = new Agenda({ db: { address: mongoConnectionString } });

// MinIO client
const minioClient = new MinioClient({
  endPoint: "nninesolution.ddns.net",
  port: 9000,
  useSSL: false,
  accessKey: "bigyan",
  secretKey: "secretbigyanpass",
});
const bucketName = "nnine-bucket";

// Ensure bucket exists
async function ensureBucket() {
  const exists = await minioClient.bucketExists(bucketName).catch(() => false);
  if (!exists) await minioClient.makeBucket(bucketName);
}
await ensureBucket();

// Upload folder to MinIO
async function uploadFolderToMinIO(localDir, remoteDir) {
  const files = fs.readdirSync(localDir);
  for (const file of files) {
    const localFile = path.join(localDir, file);
    const remoteFile = path.join(remoteDir, file).replace(/\\/g, "/"); // Windows fix
    await minioClient.fPutObject(bucketName, remoteFile, localFile);
    console.log(`📤 Uploaded: ${remoteFile}`);
  }
}

// Job definition
agenda.define("transcode-video", async (job) => {
  const { filePath, lessonId } = job.attrs.data;
  const outputPath = path.join("./uploads/courses", lessonId);
  const hlsPath = path.join(outputPath, "index.m3u8");

  fs.mkdirSync(outputPath, { recursive: true });
  console.log(`🎬 Processing video for lesson: ${lessonId}`);

  // Run FFmpeg
  await new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .setFfmpegPath(ffmpegInstaller.path)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions([
        "-hls_time 10",
        "-hls_playlist_type vod",
        `-hls_segment_filename ${path.join(outputPath, "segment%03d.ts")}`,
      ])
      .output(hlsPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });

  console.log(`✅ Video processed: ${lessonId}`);

  // Upload HLS segments to MinIO
  await uploadFolderToMinIO(outputPath, `courses/${lessonId}`);
  console.log(`✅ Uploaded to MinIO: lesson ${lessonId}`);

  // Delete local files
  fs.rmSync(outputPath, { recursive: true, force: true });
  fs.rmSync(filePath, { force: true });
  console.log(`🗑️ Local files cleaned: ${lessonId}`);
});

// Start Agenda worker
(async function () {
  await agenda.start();
  console.log("🚀 Agenda worker running...");
})();
