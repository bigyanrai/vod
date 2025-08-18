import HlsVideoPlayer from "./../VideoPlayer";

function Video() {
  const videoUrl =
    "https://nninesolution.ddns.net/nnine-bucket/courses/9e802e6c-3499-4bc9-9448-068ffa92a907/master.m3u8";

  return (
    <div>
      <h2>HLS Video Player</h2>
      <HlsVideoPlayer src={videoUrl} />
    </div>
    
  );
}

export default Video