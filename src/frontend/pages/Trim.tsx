import React, { useEffect } from "react";
import { useApplicationStore } from "../hooks/useApplicationStore";
import useVideoDownload from "../hooks/useVideoDownload";
import VideoPlayer from "../components/VideoPlayer";
import { toast } from "react-toastify";

const Trim = () => {
  const { filePath, videoFrameRate } = useApplicationStore();
  const { loading, blobUrl } = useVideoDownload(filePath);

  if (loading) {
    return <h1 className="text-4xl font-bold">Loading...</h1>;
  } else if (!blobUrl || !filePath) {
    // toast.error("Error loading video");
    return <h1 className="text-4xl font-bold">Whoops! Couldn't load video</h1>;
  }

  return (
    <section className="py-8 h-screen">
      <VideoPlayer blobUrl={blobUrl} frameRate={videoFrameRate} />
    </section>
  );
};

export default Trim;
