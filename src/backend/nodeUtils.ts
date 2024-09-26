import fs from "fs/promises";
import path from "path";
import { Print } from "lw-ffmpeg-node";

import { ffmpegModel } from "./videoapi";
import { app } from "electron";
import { disableAsar, enableAsar } from "./asarControl";

export class FileManager {
  static getFilepath(filepath: string) {
    if (process.env.NODE_ENV === "development") {
      return path.join(__dirname, "..", "..", filepath);
    } else {
      const userDataPath = app.getPath("userData");
      return path.join(userDataPath, filepath);
    }
  }

  static async exists(filePath: string) {
    try {
      await fs.access(filePath);
      return true; // The file exists
    } catch (error) {
      return false; // The file does not exist
    }
  }

  static async removeFile(filepath: string) {
    if (await this.exists(filepath)) {
      await fs.rm(filepath);
    }
  }

  static async createDirectory(
    directoryPath: string,
    options?: {
      overwrite?: boolean;
    }
  ) {
    if (await this.exists(directoryPath)) {
      if (options?.overwrite) {
        await fs.rm(directoryPath, { recursive: true, force: true });
        await fs.mkdir(directoryPath, { recursive: true });
      }
    } else {
      await fs.mkdir(directoryPath, { recursive: true });
    }
  }
}

export class VideoModel {
  static get videosPath() {
    let videosPath = "";
    if (process.env.NODE_ENV === "development") {
      videosPath = path.join(__dirname, "..", "..", "src/videos");
    } else {
      const userDataPath = app.getPath("userData");
      videosPath = path.join(userDataPath, "videos");
    }
    return videosPath;
  }

  static getYoutubeId(url: string) {
    const youtubeVideoRegex = /https:\/\/www\.youtube\.com\/watch\?v=((\w|-)+)/;
    const ytUrl = youtubeVideoRegex.exec(url)[0];
    if (!ytUrl) {
      throw new Error("Invalid Youtube URL");
    }
    const videoId = ytUrl.split("=")[1];
    return videoId;
  }

  static async renameVideoFile(url: string) {
    // this function finds your download youtube video based on id, renames it, returns filepath
    const videoId = this.getYoutubeId(url);
    const filename = (await fs.readdir(this.videosPath)).filter((file) =>
      file.includes(videoId)
    )[0];
    const fileExtension = path.extname(filename);
    const oldPath = path.join(this.videosPath, filename);
    Print.magenta("Old path:", oldPath);
    let newPath = filename.replaceAll(" ", "-");
    newPath = path.join(this.videosPath, newPath);
    newPath = `${
      newPath.split(fileExtension)[0]
    }-${crypto.randomUUID()}${fileExtension}`;
    Print.magenta("New path:", newPath);
    await fs.rename(oldPath, newPath);
    return newPath;
  }

  static async convertVideoToMp4(filepath: string, shouldCompress = false) {
    const fileExtension = path.extname(filepath);
    // early short circuit if file is already mp4
    if (fileExtension === ".mp4" && !shouldCompress) {
      return filepath;
    }
    Print.cyan("File extension:", fileExtension);
    const newFilepath = filepath.replace(fileExtension, "-compressed.mp4");
    Print.cyan("MP4 filepath:", newFilepath);
    disableAsar();
    const stdout = await ffmpegModel.cmd(
      `-y -i ${filepath} -vcodec libx264 -crf 28 -acodec aac -b:a 128k -preset ultrafast ${newFilepath}`
    );
    Print.cyan(stdout);
    enableAsar();
    return newFilepath;
  }

  static async clearVideosDirectory() {
    if (await FileManager.exists(this.videosPath)) {
      await fs.rm(this.videosPath, { recursive: true, force: true });
      await fs.mkdir(this.videosPath);
    } else {
      await fs.mkdir(this.videosPath, { recursive: true });
    }
  }

  static async getBlob(filepath: string) {
    if (!(await FileManager.exists(filepath))) {
      throw new Error("File does not exist");
    }

    const base64string = await fs.readFile(filepath, {
      encoding: "base64",
    });
    const mimeType = "video/mp4"; // Change this to the correct MIME type if needed
    const dataUrl = `data:${mimeType};base64,${base64string}`;
    return dataUrl;
    // const blob = new Blob([buffer], { type: "video/mp4" });
    // const file = new File([blob], path.basename(filepath), { type: blob.type });
    // return file;
  }
}
