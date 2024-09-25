import path from "path";
import { execFile, spawn } from "child_process";

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

class CLI {
  static linux(
    command: string,
    options?: {
      cwd?: string;
      loud?: boolean;
    }
  ) {
    // send back stderr and stdout
    return new Promise((resolve, reject) => {
      const child = spawn(command, {
        shell: "bash",
        cwd: options?.cwd,
      });
      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        options?.loud && console.log(data.toString());
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        options?.loud && console.log(data.toString());
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(stderr);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  static cmd(
    filepath: string,
    commands: string[],
    options?: {
      cwd?: string;
    }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(
        filepath,
        commands,
        {
          maxBuffer: 500 * 1_000_000,
          ...options,
        },
        (error, stdout, stderr) => {
          if (error) {
            console.log(`Error executing ${path.basename(filepath)}:`, error);
            reject(stderr);
          } else {
            resolve(stdout);
          }
        }
      );
    });
  }
}

export const ytdlpCLI = CLI.cmd.bind(null, ytdlpPath) as (
  commands: string[],
  options?: {
    cwd?: string;
  }
) => Promise<string>;
