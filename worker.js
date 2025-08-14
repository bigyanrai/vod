// import Agenda from "agenda";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
// import fs from "fs";
// import path from "path";
// import { Client as MinioClient } from "minio";

// const mongoConnectionString = "mongodb://127.0.0.1:27017/agenda";
// const agenda = new Agenda({ db: { address: mongoConnectionString } });

// // MinIO client
// const minioClient = new MinioClient({
//   endPoint: "nninesolution.ddns.net",
//   port: 9000,
//   useSSL: false,
//   accessKey: "bigyan",
//   secretKey: "secretbigyanpass",
// });
// const bucketName = "nnine-bucket";

// // Ensure bucket exists
// async function ensureBucket() {
//   const exists = await minioClient.bucketExists(bucketName).catch(() => false);
//   if (!exists) await minioClient.makeBucket(bucketName);
// }
// await ensureBucket();

// // Upload folder to MinIO
// async function uploadFolderToMinIO(localDir, remoteDir) {
//   const files = fs.readdirSync(localDir);
//   for (const file of files) {
//     const localFile = path.join(localDir, file);
//     const remoteFile = path.join(remoteDir, file).replace(/\\/g, "/"); // Windows fix
//     await minioClient.fPutObject(bucketName, remoteFile, localFile);
//     console.log(`📤 Uploaded: ${remoteFile}`);
//   }
// }

// // Job definition
// agenda.define("transcode-video", async (job) => {
//   const { filePath, lessonId } = job.attrs.data;
//   const outputPath = path.join("./uploads/courses", lessonId);
//   const hlsPath = path.join(outputPath, "index.m3u8");

//   fs.mkdirSync(outputPath, { recursive: true });
//   console.log(`🎬 Processing video for lesson: ${lessonId}`);

//   // Run FFmpeg
//   await new Promise((resolve, reject) => {
//     ffmpeg(filePath)
//       .setFfmpegPath(ffmpegInstaller.path)
//       .videoCodec("libx264")
//       .audioCodec("aac")
//       .outputOptions([
//         "-hls_time 10",
//         "-hls_playlist_type vod",
//         `-hls_segment_filename ${path.join(outputPath, "segment%03d.ts")}`,
//       ])
//       .output(hlsPath)
//       .on("end", resolve)
//       .on("error", reject)
//       .run();
//   });

//   console.log(`✅ Video processed: ${lessonId}`);

//   // Upload HLS segments to MinIO
//   await uploadFolderToMinIO(outputPath, `courses/${lessonId}`);
//   console.log(`✅ Uploaded to MinIO: lesson ${lessonId}`);

//   // Delete local files
//   fs.rmSync(outputPath, { recursive: true, force: true });
//   fs.rmSync(filePath, { force: true });
//   console.log(`🗑️ Local files cleaned: ${lessonId}`);
// });

// // Start Agenda worker
// (async function () {
//   await agenda.start();
//   console.log("🚀 Agenda worker running...");
// })();

// import Agenda from "agenda";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
// import fs from "fs";
// import path from "path";
// import { Client as MinioClient } from "minio";

// const mongoConnectionString = "mongodb://127.0.0.1:27017/agenda";
// const agenda = new Agenda({ db: { address: mongoConnectionString } });

// // MinIO client
// const minioClient = new MinioClient({
//   endPoint: "nninesolution.ddns.net",
//   port: 9000,
//   useSSL: false,
//   accessKey: "bigyan",
//   secretKey: "secretbigyanpass",
// });
// const bucketName = "nnine-bucket";

// async function ensureBucket() {
//   const exists = await minioClient.bucketExists(bucketName).catch(() => false);
//   if (!exists) await minioClient.makeBucket(bucketName);
// }
// await ensureBucket();

// async function uploadFolderToMinIO(localDir, remoteDir) {
//   const files = fs.readdirSync(localDir);
//   for (const file of files) {
//     const localFile = path.join(localDir, file);
//     const remoteFile = path.join(remoteDir, file).replace(/\\/g, "/");
//     await minioClient.fPutObject(bucketName, remoteFile, localFile);
//     console.log(`📤 Uploaded: ${remoteFile}`);
//   }
// }

// // Job definition
// agenda.define("transcode-video", async (job) => {
//   const { filePath, lessonId } = job.attrs.data;
//   const outputPath = path.join("./uploads/courses", lessonId);
//   fs.mkdirSync(outputPath, { recursive: true });
//   console.log(`🎬 Processing video for lesson: ${lessonId}`);

//   // Adaptive bitrate renditions
//   const renditions = [
//     {
//       name: "360p",
//       resolution: "640x360",
//       videoBitrate: "800k",
//       audioBitrate: "96k",
//     },
//     {
//       name: "480p",
//       resolution: "842x480",
//       videoBitrate: "1200k",
//       audioBitrate: "128k",
//     },
//     {
//       name: "720p",
//       resolution: "1280x720",
//       videoBitrate: "2500k",
//       audioBitrate: "128k",
//     },
//   ];

//   // Generate all renditions
//   const promises = renditions.map((rendition) => {
//     const dir = path.join(outputPath, rendition.name);
//     fs.mkdirSync(dir, { recursive: true });
//     const hlsPath = path.join(dir, "index.m3u8");

//     return new Promise((resolve, reject) => {
//       ffmpeg(filePath)
//         .setFfmpegPath(ffmpegInstaller.path)
//         .videoCodec("libx264")
//         .audioCodec("aac")
//         .size(rendition.resolution)
//         .videoBitrate(rendition.videoBitrate)
//         .audioBitrate(rendition.audioBitrate)
//         .outputOptions([
//           "-hls_time 10",
//           "-hls_playlist_type vod",
//           `-hls_segment_filename ${path.join(dir, "segment%03d.ts")}`,
//         ])
//         .output(hlsPath)
//         .on("end", resolve)
//         .on("error", reject)
//         .run();
//     });
//   });

//   await Promise.all(promises);

//   // Generate master playlist
//   const masterPlaylist = renditions
//     .map((r) => {
//       return `#EXT-X-STREAM-INF:BANDWIDTH=${
//         parseInt(r.videoBitrate) * 1024
//       },RESOLUTION=${r.resolution}\n${r.name}/index.m3u8`;
//     })
//     .join("\n");

//   fs.writeFileSync(
//     path.join(outputPath, "master.m3u8"),
//     "#EXTM3U\n" + masterPlaylist
//   );

//   console.log(`✅ Video processed: ${lessonId}`);

//   // Upload to MinIO
//   await uploadFolderToMinIO(outputPath, `courses/${lessonId}`);
//   console.log(`✅ Uploaded to MinIO: lesson ${lessonId}`);

//   // Delete local files
//   fs.rmSync(outputPath, { recursive: true, force: true });
//   fs.rmSync(filePath, { force: true });
//   console.log(`🗑️ Local files cleaned: ${lessonId}`);
// });

// (async function () {
//   await agenda.start();
//   console.log("🚀 Agenda worker running...");
// })();


import Agenda from "agenda";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client as MinioClient } from "minio";

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection for Agenda
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
  console.log(`📦 Preparing to upload ${files.length} files from ${localDir}`);
  for (const file of files) {
    const localFile = path.join(localDir, file);
    const remoteFile = path.join(remoteDir, file).replace(/\\/g, "/"); // Windows fix
    const stat = fs.statSync(localFile);
    if (stat.isDirectory()) {
      await uploadFolderToMinIO(localFile, path.join(remoteDir, file));
    } else {
      await minioClient.fPutObject(bucketName, remoteFile, localFile);
      console.log(`📤 Uploaded: ${remoteFile}`);
    }
  }
}

// Adaptive bitrate renditions
const renditions = [
  {
    name: "360p",
    resolution: "640x360",
    videoBitrate: "800k",
    audioBitrate: "96k",
  },
  {
    name: "480p",
    resolution: "842x480",
    videoBitrate: "1200k",
    audioBitrate: "128k",
  },
  {
    name: "720p",
    resolution: "1280x720",
    videoBitrate: "2500k",
    audioBitrate: "128k",
  },
];

// Job definition
agenda.define("transcode-video", async (job) => {
  const { filePath, lessonId } = job.attrs.data;

  const outputPath = path.resolve(__dirname, "uploads", "courses", lessonId);
  fs.mkdirSync(outputPath, { recursive: true });

  console.log(`🎬 Processing video for lesson: ${lessonId}`);

  // Process renditions sequentially
  for (const rendition of renditions) {
    console.log(`⚙️ Generating ${rendition.name}...`);
    const dir = path.join(outputPath, rendition.name);
    fs.mkdirSync(dir, { recursive: true });
    const hlsPath = path.join(dir, "index.m3u8");

    await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .setFfmpegPath(ffmpegInstaller.path)
        .videoCodec("libx264")
        .audioCodec("aac")
        .size(rendition.resolution)
        .videoBitrate(rendition.videoBitrate)
        .audioBitrate(rendition.audioBitrate)
        .outputOptions([
          "-hls_time 10",
          "-hls_playlist_type vod",
          `-hls_segment_filename ${path.join(dir, "segment%03d.ts")}`,
        ])
        .output(hlsPath)
        .on("end", () => {
          console.log(`✅ ${rendition.name} done`);
          resolve();
        })
        .on("error", (err) => {
          console.error(`❌ Error in ${rendition.name}:`, err);
          reject(err);
        })
        .run();
    });
  }

  // Generate master playlist
  const masterPlaylist = renditions
    .map((r) => {
      return `#EXT-X-STREAM-INF:BANDWIDTH=${
        parseInt(r.videoBitrate) * 1024
      },RESOLUTION=${r.resolution}\n${r.name}/index.m3u8`;
    })
    .join("\n");

  fs.writeFileSync(
    path.join(outputPath, "master.m3u8"),
    "#EXTM3U\n" + masterPlaylist
  );
  console.log(`📄 Master playlist created`);

  // Upload to MinIO
  await uploadFolderToMinIO(outputPath, `courses/${lessonId}`);
  console.log(`✅ Uploaded to MinIO: lesson ${lessonId}`);

  // Cleanup
  fs.rmSync(outputPath, { recursive: true, force: true });
  fs.rmSync(filePath, { force: true });
  console.log(`🗑️ Local files cleaned: ${lessonId}`);
});

// Start Agenda worker
(async function () {
  await agenda.start();
  console.log("🚀 Agenda worker running...");
})();
