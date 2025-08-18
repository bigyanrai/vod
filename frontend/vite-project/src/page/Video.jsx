import HlsVideoPlayer from "./../VideoPlayer";

function Video() {
  const videoUrl =
    "https://nninesolution.ddns.net/nnine-bucket/courses/03915f8b-5cef-4e30-b554-5b8db808edbd/master.m3u8";

  return (
    <div>
      <h2>HLS Video Player</h2>
      <HlsVideoPlayer src={videoUrl} />
    </div>
  );
}

export default Video;
