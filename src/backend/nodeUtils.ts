import fs from "fs/promises";
import { v4 as uuid } from "uuid";
import path from "path";
import { Print } from "./utils";

class FileManager {
  static async fileExists(filePath: string) {
    try {
      await fs.access(filePath);
      return true; // The file exists
    } catch (error) {
      return false; // The file does not exist
    }
  }
}

export class VideoModel {
  static readonly videosPath = path.join(__dirname, "..", "..", "src/videos");

  static getYoutubeId(url: string) {
    const youtubeVideoRegex = /https:\/\/www\.youtube\.com\/watch\?v=(\w+)/;
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
    const oldPath = path.join(this.videosPath, filename);
    Print.cyan("Old path:", oldPath);
    let newPath = filename.replaceAll(" ", "-");
    newPath = path.join(this.videosPath, newPath);
    newPath = `${newPath.split(".mp4")[0]}-${uuid()}.mp4`;
    Print.cyan("New path:", newPath);
    fs.rename(oldPath, newPath);
    return newPath;
  }

  static async clearVideosDirectory() {
    if (await FileManager.fileExists(this.videosPath)) {
      await fs.rmdir(this.videosPath, { recursive: true });
      await fs.mkdir(this.videosPath);
    } else {
      await fs.mkdir(this.videosPath);
    }
  }

  static async getBlob(filepath: string) {
    if (!(await FileManager.fileExists(filepath))) {
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
