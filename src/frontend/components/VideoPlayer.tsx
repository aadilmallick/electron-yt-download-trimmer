import React from "react";
import VolumeControls, { VolumeControlsProps } from "./VolumeControls";
import { toast } from "react-toastify";
import { Loader } from "./Loader";
import VideoPlayerModel from "../utils/VideoPlayerModel";
import PlaybackSpeedControls from "./PlaybackSpeedControls";

interface VideoPlayerProps {
  blobUrl: string;
  frameRate: number;
}

const VideoPlayer = ({ blobUrl, frameRate }: VideoPlayerProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [volumeState, setVolumeState] =
    React.useState<VolumeControlsProps["state"]>("high");
  const [sliderVolume, setSliderVolume] = React.useState(1);
  const [inpoint, setInpoint] = React.useState(-1);
  const [outpoint, setOutpoint] = React.useState(-1);
  const [sliceLoading, setSliceLoading] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);

  const markInpoint = (currentTime: number, videoDuration: number) => {
    if (currentTime > -1) {
      setInpoint(currentTime);
    } else if (outpoint > -1 && currentTime > outpoint) {
      setInpoint(currentTime);
      setOutpoint(videoDuration);
    } else {
      setInpoint(0);
    }
  };

  const markOutpoint = (currentTime: number, videoDuration: number) => {
    if (currentTime > -1 && currentTime > inpoint) {
      setOutpoint(currentTime);
    } else if (currentTime < inpoint && currentTime > 0) {
      setInpoint(0);
      setOutpoint(currentTime);
    } else {
      setInpoint(0);
      setOutpoint(videoDuration);
    }
  };

  const convertPointToNumber = (num: number) => {
    if (num === -1) {
      return "--:--";
    } else {
      return VideoPlayerModel.formatTimestamp(num);
    }
  };

  const handleSliderVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      videoRef.current.volume = Number(e.target.value);
    }
  };

  React.useEffect(() => {
    if (!blobUrl) return;
    const video = videoRef.current;
    if (!video) return;

    const videoModel = new VideoPlayerModel(video);
    videoModel.setFramerate(frameRate);
    setSliderVolume(videoModel.volume);

    // clicking on mute button
    videoModel.assignEventListener("click", videoModel.muteBtn, () => {
      videoModel.toggleMute();
      if (videoModel.isMuted === true) {
        setVolumeState("muted");
      } else {
        videoModel.volume > 0.5
          ? setVolumeState("high")
          : setVolumeState("low");
      }
    });

    // the slider change event should change volume, which triggers this event.
    videoModel.assignVideoEventListener("volumechange", () => {
      setSliderVolume(videoModel.volume);
      if (videoModel.volume === 0 || videoModel.isMuted) {
        setVolumeState("muted");
        videoModel.setMuted(true);
      } else {
        videoModel.volume > 0.5
          ? setVolumeState("high")
          : setVolumeState("low");
      }
    });

    function setKeyBoardShortcuts(e: KeyboardEvent) {
      if (e.shiftKey && e.code === "ArrowRight") {
        e.preventDefault();
        videoModel.skip(1);
        return;
      }
      if (e.shiftKey && e.code === "ArrowLeft") {
        e.preventDefault();
        videoModel.skip(-1);
        return;
      }
      switch (e.key.toLowerCase()) {
        case " ":
          videoModel.togglePlay();
          break;
        case "i":
          console.log(inpoint, outpoint);

          markInpoint(
            videoModel.getPlaybackInfo().currentTime,
            videoModel.getPlaybackInfo().duration
          );
          toast.info("Inpoint set");

          break;
        case "o":
          markOutpoint(
            videoModel.getPlaybackInfo().currentTime,
            videoModel.getPlaybackInfo().duration
          );
          toast.info("Outpoint set");

          break;
        case "n":
          videoModel.nextFrame();
          break;
        case "b":
          videoModel.previousFrame();
          break;
        case "arrowleft":
          videoModel.skip(-5);
          break;
        case "arrowright":
          videoModel.skip(5);
          break;
      }
    }
    document.addEventListener("keydown", setKeyBoardShortcuts);

    // cleanup function
    return () => {
      videoModel.removeListeners();
      document.removeEventListener("keydown", setKeyBoardShortcuts);
    };
  }, [blobUrl]);

  const downloadSlice = async () => {
    console.log("downloading slice ...");
    if (inpoint === -1 || outpoint === -1) {
      toast.error("Please set inpoint and outpoint");
      return;
    }
    // TODO: download slice
  };

  return (
    <>
      <div className="video-container">
        <div className="timeline-container">
          <div className="timeline">
            <img className="preview-img" />
            <div className="thumb-indicator"></div>
            {/* <div className="inpoint-indicator">I</div> */}
            {/* <div className="outpoint-indicator">O</div> */}
          </div>
        </div>
        <div className="video-controls">
          <button data-action="play" className="paused"></button>
          <VolumeControls
            state={volumeState}
            sliderVolume={sliderVolume}
            onSliderVolumeChange={handleSliderVolumeChange}
          />
          <div className="duration-container">
            <div className="current-time">0:00</div>/
            <div className="total-time"></div>
          </div>
          <PlaybackSpeedControls
            speed={speed}
            onSpeedChange={(num: number) => {
              setSpeed(num);
              if (videoRef.current) {
                videoRef.current.playbackRate = num;
              }
            }}
          />
        </div>
        <video ref={videoRef}>
          <source src={blobUrl} type="video/mp4" />
        </video>
      </div>
      <div className="inpoint-outpoint-container space-y-4">
        <p>Inpoint: {convertPointToNumber(inpoint)}</p>
        <p>Outpoint: {convertPointToNumber(outpoint)}</p>
        <button
          className="bg-black px-4 py-2 rounded-sm text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={downloadSlice}
          disabled={sliceLoading}
        >
          Create slice
        </button>
        {sliceLoading && <Loader />}
      </div>
      <div className="shortcuts py-8 max-w-[1000px] mx-auto px-4">
        <p>
          Press <kbd>n</kbd> to go to next frame
        </p>
        <p>
          Press <kbd>b</kbd> to go to previous frame
        </p>
        <p>
          Press <kbd>i</kbd> to set inpoint
        </p>
        <p>
          Press <kbd>o</kbd> to set outpoint
        </p>
      </div>
    </>
  );
};

export default VideoPlayer;
