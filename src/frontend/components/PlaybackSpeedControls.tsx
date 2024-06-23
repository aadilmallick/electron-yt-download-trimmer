import React from "react";

const PlaybackSpeedControls = ({
  speed,
  onSpeedChange,
}: {
  speed: number;
  onSpeedChange: (number: number) => void;
}) => {
  return (
    <button
      className="playback-speed-container"
      onClick={() => {
        if (speed >= 2) {
          onSpeedChange(0.25);
        } else {
          onSpeedChange(speed + 0.25);
        }
      }}
    >
      {numberToPlaybackRate(speed)}
    </button>
  );
};

function numberToPlaybackRate(speed: number): string {
  if (Math.round(speed) === speed) {
    // is int
    return `${speed}x`;
  } else {
    return `${speed.toFixed(2)}x`;
  }
}

export default PlaybackSpeedControls;
