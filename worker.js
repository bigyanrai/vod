// worker.js
import Agenda from "agenda";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client as MinioClient } from "minio";

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
      await minioClient.fPutObject(bucketName, remoteFile, localFile);
      uploadedFiles++;
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

  let currentProgress = 0;

  const updateProgress = async (percent, stage) => {
    const safePercent = Math.max(job.attrs.data.progress || 0, percent);
    job.attrs.data.progress = safePercent;
    job.attrs.data.stage = stage;
    await job.save();
    currentProgress = safePercent;
    console.log(`📊 Progress updated: ${safePercent.toFixed(2)}%, Stage: ${stage}`);
  };

  // Transcoding each rendition
  const perRenditionProgress = 60 / renditions.length;

  for (let i = 0; i < renditions.length; i++) {
    const rendition = renditions[i];
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
        .on("progress", async (prog) => {
          const percent = i * perRenditionProgress + ((prog.percent || 0) / 100) * perRenditionProgress;
          await updateProgress(percent, "transcoding");
        })
        .on("end", resolve)
        .on("error", reject)
        .output(hlsPath)
        .run();
    });
  }

  // Master playlist
  const masterPlaylist = renditions
    .map((r) => `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(r.videoBitrate) * 1024},RESOLUTION=${r.resolution}\n${r.name}/index.m3u8`)
    .join("\n");
  fs.writeFileSync(path.join(outputPath, "master.m3u8"), "#EXTM3U\n" + masterPlaylist);

  // Upload
  await uploadFolderToMinIO(outputPath, `courses/${lessonId}`, async ({ uploaded, total }) => {
    const percent = 60 + (uploaded / total) * 30;
    await updateProgress(percent, "uploading");
  });

  // Cleanup
  await updateProgress(90, "cleanup");
  fs.rmSync(outputPath, { recursive: true, force: true });
  fs.rmSync(filePath, { force: true });

  await updateProgress(100, "done");
  console.log(`🎉 Lesson ${lessonId} processing completed!`);
});

(async function () {
  await agenda.start();
  console.log("🚀 Agenda worker running...");
})();
