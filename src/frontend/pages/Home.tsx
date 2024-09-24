import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "../components/Loader";
import useIsOnline from "../hooks/useIsOnline";
import { toast } from "react-toastify";
import { useApplicationStore } from "../hooks/useApplicationStore";
import useInterval from "../hooks/useInterval";

const Home = () => {
  return (
    <section className="h-screen flex flex-col items-center">
      <div className="max-w-[40rem] shadow-lg rounded-lg bg-white py-4 px-8 mt-24">
        <h1 className="text-3xl font-bold">Video uploader</h1>
        <VideoUploadButton />
      </div>
    </section>
  );
};

const VideoUploadButton = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isOnline } = useIsOnline();
  const { setFilePath, setVideoFrameRate } = useApplicationStore();
  const [message, setMessage] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { startInterval, stopInterval } = useInterval(1);

  async function uploadUrl() {
    setLoading(true);

    startInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    });

    window.appApi.downloadYoutubeURL(url);

    window.appApi.handleEvent("success:uploading", (payload) => {
      toast.success(payload.message);

      // set filepath and framerate of video
      setFilePath(payload.filepath);
      setVideoFrameRate(payload.framerate);
      setLoading(false);
      navigate("/trim");

      stopInterval();
      setTimeElapsed(0);
    });

    window.appApi.handleEvent("error:uploading", (payload) => {
      toast.error(payload.message);
      setLoading(false);
      setMessage("");

      stopInterval();
      setTimeElapsed(0);
    });

    window.appApi.handleEvent("video:isdownloading", () => {
      setMessage("Downloading video...");
    });

    window.appApi.handleEvent("video:iscompressing", () => {
      setMessage("compressing video...");
    });
  }

  function ConditionalContent(loading: boolean) {
    if (!loading && isOnline) {
      return (
        <button
          className="bg-black text-white font-semibold px-4 py-2 w-full text-center rounded-md focus:ring-blue-300 focus:ring-2"
          onClick={uploadUrl}
        >
          Trim
        </button>
      );
    } else if (!isOnline) {
      return (
        <div className="text-red-500 text-sm text-center mt-4">
          You are offline. Please connect to the internet to upload the video.
        </div>
      );
    } else {
      return <Loader />;
    }
  }

  return (
    <>
      <input
        type="text"
        name="url"
        id="url"
        className="p-2 border rounded-md my-4 text-sm w-full"
        placeholder="https://youtube.com/v=..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      {ConditionalContent(loading)}
      <p className="font-bold text-center my-2">{message}</p>
      <p className="text-gray-500 text-center my-2">
        {timeElapsed !== 0 && `${timeElapsed} seconds...`}
      </p>
    </>
  );
};

export default Home;
