// worker.js
import Agenda from "agenda";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client as MinioClient } from "minio";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mongoConnectionString = "mongodb://127.0.0.1:27017/agenda";
const agenda = new Agenda({ db: { address: mongoConnectionString }, maxConcurrency: 2 });

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
  console.log("📦 Checking MinIO bucket...");
  const exists = await minioClient.bucketExists(bucketName).catch(() => false);
  if (!exists) {
    console.log("📦 Bucket not found. Creating...");
    await minioClient.makeBucket(bucketName);
    console.log("✅ Bucket created");
  } else console.log("✅ Bucket exists");
}
await ensureBucket();

// Upload folder with full logging
async function uploadFolderToMinIO(localDir, remoteDir, onProgress) {
  const files = fs.readdirSync(localDir);
  const totalFiles = files.length;
  let uploadedFiles = 0;

  for (const file of files) {
    const localFile = path.join(localDir, file);
    const remoteFile = path.join(remoteDir, file).replace(/\\/g, "/");
    const stat = fs.statSync(localFile);

    if (stat.isDirectory()) {
      await uploadFolderToMinIO(localFile, path.join(remoteDir, file), onProgress);
    } else {
      console.log(`⬆ Uploading file to MinIO: ${remoteFile}`);
      await minioClient.fPutObject(bucketName, remoteFile, localFile);
      uploadedFiles++;
      console.log(`✅ Uploaded ${file} (${uploadedFiles}/${totalFiles})`);
      if (onProgress) onProgress({ uploaded: uploadedFiles, total: totalFiles });
    }
  }
}

const renditions = [
  { name: "360p", resolution: "640x360", videoBitrate: "800k", audioBitrate: "96k" },
  { name: "480p", resolution: "842x480", videoBitrate: "1200k", audioBitrate: "128k" },
  { name: "720p", resolution: "1280x720", videoBitrate: "2500k", audioBitrate: "128k" },
];

agenda.define("transcode-video", { concurrency: 1, lockLifetime: 1000 * 60 * 60 }, async (job) => {
  const { filePath, lessonId } = job.attrs.data;
  const outputPath = path.resolve(__dirname, "uploads", "courses", lessonId);
  fs.mkdirSync(outputPath, { recursive: true });

  console.log(`🎬 Starting video processing for lesson: ${lessonId}`);

  let currentRenditionIndex = 0;

  const updateProgress = async (progress, stage) => {
    job.attrs.data.progress = progress;
    job.attrs.data.stage = stage;
    await job.save();
    console.log(`📊 Progress updated: ${progress.toFixed(2)}%, Stage: ${stage}`);
  };

  await updateProgress(0, "transcoding");

  for (const rendition of renditions) {
    const dir = path.join(outputPath, rendition.name);
    fs.mkdirSync(dir, { recursive: true });
    const hlsPath = path.join(dir, "index.m3u8");

    console.log(`🎥 Transcoding rendition: ${rendition.name}`);
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
        .on("progress", async (prog) => {
          const percent = prog && prog.percent ? ((currentRenditionIndex + prog.percent / 100) / renditions.length) * 60 : 0;
          await updateProgress(percent, "transcoding");
          process.stdout.write(`\r⏳ Transcoding progress: ${percent.toFixed(2)}%`);
        })
        .on("end", () => {
          console.log(`✅ Rendition ${rendition.name} done`);
          currentRenditionIndex++;
          resolve();
        })
        .on("error", (err) => {
          console.error(`❌ Error transcoding ${rendition.name}:`, err);
          reject(err);
        })
        .output(hlsPath)
        .run();
    });
  }

  // Master playlist
  console.log("📃 Creating master playlist...");
  const masterPlaylist = renditions
    .map((r) => `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(r.videoBitrate) * 1024},RESOLUTION=${r.resolution}\n${r.name}/index.m3u8`)
    .join("\n");
  fs.writeFileSync(path.join(outputPath, "master.m3u8"), "#EXTM3U\n" + masterPlaylist);
  console.log("✅ Master playlist created");

  // Upload to MinIO
  console.log("⬆ Uploading all files to MinIO...");
  await updateProgress(60, "uploading");
  await uploadFolderToMinIO(outputPath, `courses/${lessonId}`, async ({ uploaded, total }) => {
    const percent = 60 + (uploaded / total) * 30;
    await updateProgress(percent, "uploading");
  });
  console.log("✅ All files uploaded to MinIO");

  // Cleanup
  console.log("🧹 Cleaning up local files...");
  await updateProgress(90, "cleanup");
  fs.rmSync(outputPath, { recursive: true, force: true });
  fs.rmSync(filePath, { force: true });
  console.log("✅ Local files removed");

  await updateProgress(100, "done");
  console.log(`🎉 Lesson ${lessonId} processing completed!`);
});

(async function () {
  await agenda.start();
  console.log("🚀 Agenda worker running...");
})();
