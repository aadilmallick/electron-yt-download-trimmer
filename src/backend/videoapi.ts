import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs/promises";
import { execFile } from "child_process";
import { Print } from "./utils";

const getBinaryPath = (binaryName: string) => {
  let binaryPath;
  if (process.env.NODE_ENV === "development") {
    binaryPath = path.join(__dirname, "..", "..", "src/binaries", binaryName);
  } else {
    binaryPath = path.join(process.resourcesPath, "binaries", binaryName);
  }
  return binaryPath;
};

const ffmpegPath = getBinaryPath("ffmpeg.exe");
const ffprobePath = getBinaryPath("ffprobe.exe");
const ytdlpPath = getBinaryPath("yt-dlp.exe");

console.log("FFmpeg Path:", ffmpegPath);
console.log("yt-dlp Path:", ytdlpPath);

class CLI {
  static cmd(filepath: string, command: string, options?: { cwd?: string }) {
    const args = command.split(" ");
    const cliOptions = options ? options : {};
    return new Promise((resolve, reject) => {
      execFile(
        filepath,
        args,
        {
          maxBuffer: 500 * 1_000_000,
          ...cliOptions,
        },
        (error, stdout, stderr) => {
          if (error) {
            Print.yellow(`Error executing ${path.basename(filepath)}:`, error);
            reject(stderr);
          } else {
            resolve(stdout);
          }
        }
      );
    });
  }
}

export class YTDLPModel {
  static cmd: (command: string, options?: { cwd?: string }) => Promise<string> =
    CLI.cmd.bind(null, ytdlpPath);

  static async getVersion() {
    return await this.cmd("--version");
  }

  static async downloadVideo(url: string) {
    // const stdout = await this.cmd(
    //   `-i -f 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4' ${url}`
    // );
    const youtubeVideoRegex = /https:\/\/www\.youtube\.com\/watch\?v=\w+/;
    const ytUrl = youtubeVideoRegex.exec(url)[0];
    if (!ytUrl) {
      throw new Error("Invalid Youtube URL");
    }
    const stdout = await this.cmd(`${ytUrl}`, {
      cwd: path.join(__dirname, "..", "..", "src/videos"),
    });
    return stdout;
  }
}

export class FFMPEGModel {
  static cmd: (command: string) => Promise<string> = CLI.cmd.bind(
    null,
    ffmpegPath
  );

  static async getVersion() {
    return await this.cmd("-version");
  }

  static async compress(inputPath: string, outputPath: string) {
    const stdout = await this.cmd(
      `-y -i ${inputPath} -vcodec libx264 -crf 28 -acodec copy ${outputPath}`
    );
    return stdout;
  }

  static async createVideoSlice(
    input_path: string,
    output_path: string,
    inpoint: number,
    outpoint: number
  ) {
    if (inpoint >= outpoint) {
      throw new Error("inpoint must be less than outpoint");
    }
    if (inpoint < 0) {
      throw new Error("inpoint must be greater than or equal to 0");
    }
    const duration = await FFPROBEModel.getVideoDuration(input_path);
    if (outpoint > duration || inpoint > duration) {
      throw new Error("outpoint must be less than the video duration");
    }

    await this.cmd(
      `-y -ss ${inpoint} -t ${
        outpoint - inpoint
      } -i ${input_path} -c copy ${output_path}`
    );
    return output_path;
  }

  static async cropVideo(
    inputPath: string,
    outputPath: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    await this.cmd(
      `-y -i ${inputPath} -vf "crop=${width}:${height}:${x}:${y}" ${outputPath}`
    );
  }
  static async changeSize(
    inputPath: string,
    outputPath: string,
    width: number,
    height: number
  ) {
    await this.cmd(`-y -i ${inputPath} -s ${width}x${height} ${outputPath}`);
  }
  static async changeFramerate(
    inputPath: string,
    outputPath: string,
    frameRate: number
  ) {
    await this.cmd(`-y -i ${inputPath} -r ${frameRate} ${outputPath}`);
  }

  static async saveThumbnail(
    inputPath: string,
    outputPath: string,
    time: number
  ) {
    await this.cmd(`-y -ss ${time} -i ${inputPath} -vframes 1 ${outputPath}`);
  }
}

export class FFPROBEModel {
  static cmd: (command: string) => Promise<string> = CLI.cmd.bind(
    null,
    ffprobePath
  );

  static async getVersion() {
    return await this.cmd("-version");
  }

  static async getVideoInfo(filepath: string) {
    const part1 =
      "-v error -print_format json -select_streams v:0 -show_format -show_streams";
    const part2 =
      "-show_entries stream=codec_name,width,height,bit_rate,r_frame_rate";
    const part3 = "-show_entries format=duration,filename,nb_streams,size";
    const stdout = await this.cmd(`${part1} ${part2} ${part3} ${filepath}`);
    const data = JSON.parse(stdout);
    const info = {
      codec_name: data.streams[0].codec_name as string,
      width: Number(data.streams[0].width),
      height: Number(data.streams[0].height),
      bit_rate: Number(data.streams[0].bit_rate),
      r_frame_rate: this.convertFractionStringToNumber(
        data.streams[0].r_frame_rate
      ),
      filename: data.format.filename as string,
      duration: Number(data.format.duration),
      nb_streams: data.format.nb_streams as number,
      size: Number(data.format.size),
    };
    return info;
  }

  static async getVideoDuration(filePath: string) {
    const command = `-v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${filePath}`;
    const duration = await this.cmd(command);
    return Number(duration);
  }

  static async getVideoFrameRate(filePath: string) {
    try {
      const command = `-v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 ${filePath}`;
      const framerate = await this.cmd(command);
      return this.convertFractionStringToNumber(framerate);
    } catch (e) {
      Print.red("Error getting frame rate:", e);
      return 30;
    }
  }

  private static convertFractionStringToNumber(fractionString: string) {
    const [numerator, denominator] = fractionString.split("/").map(Number);
    if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
      throw new Error("Invalid fraction string");
    }
    return numerator / denominator;
  }
}
