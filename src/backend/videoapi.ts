import { app, BrowserWindow } from "electron";
import path from "path";
import { execFile } from "child_process";
import { Print } from "@2022amallick/print-colors";

import prcs from "process";
import { FFMPEGPathModel, YTDLPModel } from "lw-ffmpeg-node";

export const getBinaryPath = (binaryName: string): string => {
  let binaryPath = null;
  if (process.env.NODE_ENV === "development") {
    binaryPath = path.join(__dirname, "..", "..", "src/binaries", binaryName);
  } else {
    binaryPath = path.join(prcs.resourcesPath, "binaries", binaryName);
  }
  return binaryPath;
};

const getBinaries = () => {
  if (process.platform === "win32") {
    return {
      ffmpegPath: getBinaryPath("ffmpeg.exe"),
      ffprobePath: getBinaryPath("ffprobe.exe"),
      ytdlpPath: getBinaryPath("yt-dlp.exe"),
    };
  } else if (process.platform === "linux" || process.platform === "darwin") {
    return {
      ffmpegPath: getBinaryPath("ffmpeg"),
      ffprobePath: getBinaryPath("ffprobe"),
      ytdlpPath: getBinaryPath("yt-dlp"),
    };
  }
};
const { ffmpegPath, ffprobePath, ytdlpPath } = getBinaries();

Print.green("FFmpeg Path:", ffmpegPath);
Print.green("yt-dlp Path:", ytdlpPath);

export const ytdlpModel = new YTDLPModel(ytdlpPath);
export const ffmpegModel = new FFMPEGPathModel(ffmpegPath, ffprobePath);
