// // added progress tracking
// import Agenda from "agenda";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import { Client as MinioClient } from "minio";

// // Fix __dirname in ES module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // MongoDB connection for Agenda
// const mongoConnectionString = "mongodb://127.0.0.1:27017/agenda";

// // Limit concurrency: maximum 2 jobs at a time
// const agenda = new Agenda({
//   db: { address: mongoConnectionString },
//   maxConcurrency: 2,          // max jobs running at same time
//   defaultLockLifetime: 1000*60*60 // 1 hour lock for long jobs
// });

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

// // Upload folder to MinIO with progress callback
// async function uploadFolderToMinIO(localDir, remoteDir, onProgress) {
//   const files = fs.readdirSync(localDir);
//   const totalFiles = files.length;
//   let uploadedFiles = 0;

//   for (const file of files) {
//     const localFile = path.join(localDir, file);
//     const remoteFile = path.join(remoteDir, file).replace(/\\/g, "/");
//     const stat = fs.statSync(localFile);

//     if (stat.isDirectory()) {
//       await uploadFolderToMinIO(localFile, path.join(remoteDir, file), (progress) => {
//         if (onProgress) onProgress(progress);
//       });
//     } else {
//       await minioClient.fPutObject(bucketName, remoteFile, localFile);
//       uploadedFiles++;
//       if (onProgress) onProgress({ uploaded: uploadedFiles, total: totalFiles });
//     }
//   }
// }

// // Adaptive bitrate renditions
// const renditions = [
//   { name: "360p", resolution: "640x360", videoBitrate: "800k", audioBitrate: "96k" },
//   { name: "480p", resolution: "842x480", videoBitrate: "1200k", audioBitrate: "128k" },
//   { name: "720p", resolution: "1280x720", videoBitrate: "2500k", audioBitrate: "128k" },
// ];

// // Define job with concurrency and locking
// agenda.define(
//   "transcode-video",
//   { concurrency: 1, lockLifetime: 1000*60*60 }, // 1 job of this type at a time
//   async (job) => {
//     const { filePath, lessonId } = job.attrs.data;
//     const outputPath = path.resolve(__dirname, "uploads", "courses", lessonId);
//     fs.mkdirSync(outputPath, { recursive: true });

//     console.log(`🎬 Processing video for lesson: ${lessonId}`);

//     let totalRenditions = renditions.length;
//     let currentRenditionIndex = 0;

//     // Transcoding with progress
//     for (const rendition of renditions) {
//       console.log(`⚙️ Generating ${rendition.name}...`);
//       const dir = path.join(outputPath, rendition.name);
//       fs.mkdirSync(dir, { recursive: true });
//       const hlsPath = path.join(dir, "index.m3u8");

//       await new Promise((resolve, reject) => {
//         ffmpeg(filePath)
//           .setFfmpegPath(ffmpegInstaller.path)
//           .videoCodec("libx264")
//           .audioCodec("aac")
//           .size(rendition.resolution)
//           .videoBitrate(rendition.videoBitrate)
//           .audioBitrate(rendition.audioBitrate)
//           .outputOptions([
//             "-hls_time 10",
//             "-hls_playlist_type vod",
//             `-hls_segment_filename ${path.join(dir, "segment%03d.ts")}`,
//           ])
//           .on("progress", (progress) => {
//             const percent = ((currentRenditionIndex + progress.percent / 100) / totalRenditions) * 100;
//             process.stdout.write(`\r⏳ Overall progress: ${percent.toFixed(2)}%`);
//           })
//           .on("end", () => {
//             currentRenditionIndex++;
//             console.log(`\n✅ ${rendition.name} done`);
//             resolve();
//           })
//           .on("error", (err) => {
//             console.error(`❌ Error in ${rendition.name}:`, err);
//             reject(err);
//           })
//           .output(hlsPath)
//           .run();
//       });
//     }

//     // Master playlist
//     const masterPlaylist = renditions
//       .map((r) => `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(r.videoBitrate) * 1024},RESOLUTION=${r.resolution}\n${r.name}/index.m3u8`)
//       .join("\n");

//     fs.writeFileSync(path.join(outputPath, "master.m3u8"), "#EXTM3U\n" + masterPlaylist);
//     console.log(`📄 Master playlist created`);

//     // Upload with progress
//     console.log(`📦 Uploading to MinIO...`);
//     let totalUploaded = 0;
//     await uploadFolderToMinIO(outputPath, `courses/${lessonId}`, ({ uploaded, total }) => {
//       totalUploaded++;
//       const percent = (totalUploaded / (total * renditions.length + 1)) * 100;
//       process.stdout.write(`\r⏳ Upload progress: ${percent.toFixed(2)}%`);
//     });
//     console.log(`\n✅ Uploaded to MinIO: lesson ${lessonId}`);

//     // Cleanup
//     fs.rmSync(outputPath, { recursive: true, force: true });
//     fs.rmSync(filePath, { force: true });
//     console.log(`🗑️ Local files cleaned: ${lessonId}`);
//   }
// );

// // Start Agenda worker
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
const agenda = new Agenda({
  db: { address: mongoConnectionString },
  maxConcurrency: 2,
});

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

// In-memory progress store (lessonId -> overallProgress)
export const lessonProgress = {};

// Upload folder to MinIO with retries
async function uploadFolderToMinIO(localDir, remoteDir) {
  const files = fs.readdirSync(localDir);

  for (const file of files) {
    const localFile = path.join(localDir, file);
    const remoteFile = path.join(remoteDir, file).replace(/\\/g, "/");
    const stat = fs.statSync(localFile);

    if (stat.isDirectory()) {
      await uploadFolderToMinIO(localFile, path.join(remoteDir, file));
    } else {
      let uploaded = false;
      let attempts = 0;
      while (!uploaded && attempts < 3) {
        try {
          await minioClient.fPutObject(bucketName, remoteFile, localFile);
          uploaded = true;
          console.log(`📤 Uploaded: ${remoteFile}`);
        } catch (err) {
          attempts++;
          console.error(`⚠️ Retry ${attempts} failed for ${remoteFile}:`, err);
        }
      }
      if (!uploaded)
        throw new Error(`Failed to upload ${remoteFile} after 3 attempts`);
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

// Process single rendition with progress tracking
function processRendition(
  filePath,
  outputPath,
  rendition,
  lessonId,
  renditionProgress
) {
  return new Promise((resolve, reject) => {
    const dir = path.join(outputPath, rendition.name);
    fs.mkdirSync(dir, { recursive: true });
    const hlsPath = path.join(dir, "index.m3u8");

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
      .on("progress", (progress) => {
        const percent = progress.percent || 0;
        renditionProgress[rendition.name] = percent;

        // Calculate overall progress
        const totalPercent = Object.values(renditionProgress).reduce(
          (a, b) => a + b,
          0
        );
        const overallProgress = totalPercent / renditions.length;

        lessonProgress[lessonId] = parseFloat(overallProgress.toFixed(2));
        console.log(
          `📊 Lesson ${lessonId} overall progress: ${lessonProgress[lessonId]}%`
        );
      })
      .on("end", () => {
        renditionProgress[rendition.name] = 100;
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

// Agenda job definition
agenda.define(
  "transcode-video",
  { concurrency: 2, lockLifetime: 1000 * 60 * 60 },
  async (job) => {
    const { filePath, lessonId } = job.attrs.data;
    const outputPath = path.resolve(__dirname, "uploads", "courses", lessonId);
    fs.mkdirSync(outputPath, { recursive: true });

    console.log(`🎬 Processing video for lesson: ${lessonId}`);

    const renditionProgress = {}; // track per-job progress

    try {
      // Run renditions in parallel
      await Promise.all(
        renditions.map((r) =>
          processRendition(filePath, outputPath, r, lessonId, renditionProgress)
        )
      );

      // Generate master playlist
      const masterPlaylist = renditions
        .map((r) => {
          const bandwidth = parseInt(r.videoBitrate.replace("k", "")) * 1000;
          return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${r.resolution}\n${r.name}/index.m3u8`;
        })
        .join("\n");

      fs.writeFileSync(
        path.join(outputPath, "master.m3u8"),
        "#EXTM3U\n" + masterPlaylist
      );
      console.log(`📄 Master playlist created`);

      // Upload to MinIO
      console.log("📦 Uploading to MinIO...");
      await uploadFolderToMinIO(outputPath, `courses/${lessonId}`);
      console.log(`✅ Uploaded to MinIO: lesson ${lessonId}`);
    } catch (err) {
      console.error(`❌ Job failed for lesson ${lessonId}:`, err);
    } finally {
      // Cleanup
      fs.rmSync(outputPath, { recursive: true, force: true });
      if (fs.existsSync(filePath)) fs.rmSync(filePath, { force: true });
      lessonProgress[lessonId] = 100; // mark as complete
      console.log(`🗑️ Local files cleaned: ${lessonId}`);
    }
  }
);

// Start Agenda worker
(async function () {
  await agenda.start();
  console.log("🚀 Agenda worker running...");
})();
