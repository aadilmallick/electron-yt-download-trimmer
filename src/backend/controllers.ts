import path from "path";
import { app, dialog, shell } from "electron";
import { FileManager, VideoModel } from "./nodeUtils";
import { IPC, IPCNew } from "./utils";
import { Print } from "@2022amallick/print-colors";

import { ffmpegModel, ytdlpModel, getBinaryPath, ytdlpCLI } from "./videoapi";
import fs from "fs/promises";
import { LoggerMain } from "./productionLogger";

function ensureHttps(url: string) {
  if (!url.startsWith("https://")) {
    // If the URL does not start with https://, add the prefix
    if (url.startsWith("http://")) {
      return url.replace("http://", "https://");
    }
    return `https://${url.trim()}`;
  }
  // If already starts with https://, return the URL as it is
  return url.trim();
}

const log = new LoggerMain();
log.logInfo();

const ytdlppath = getBinaryPath("yt-dlp");
log.log(`yt-dlp path is: ${ytdlppath}`);
log.log(`app path is: ${app.getPath("userData")}`);

(async () => {
  try {
    const version = await ytdlpModel.getVersion();
    log.log(`yt-dlp Version: ${version}`);
  } catch (e) {
    log.error(`Error getting yt-dlp version: ${e}`);
  }
})();

const globalObj: {
  slicesDir: string | null;
  sliceNum: number;
} = {
  slicesDir: null,
  sliceNum: 0,
};

export const onClearVideos = async (window: Electron.BrowserWindow) => {
  log.log(`in on clear videos`);
  IPC.listenOnMain("video:clear", async (event, _) => {
    try {
      await VideoModel.clearVideosDirectory();
      globalObj.slicesDir = null;
      globalObj.sliceNum = 0;
      Print.green("Cleared videos directory");
      log.log(`Cleared videos directory`);

      IPC.sendToRenderer(window, "success:clear", {
        message: "Videos cleared successfully.",
      });
    } catch (e) {
      Print.red("Error clearing videos directory:", e);
      IPC.sendToRenderer(window, "error:clear", {
        message: "Oops, the videos couldn't be cleared.",
      });
    }
  });
};

export const onUploadSlice = async (window: Electron.BrowserWindow) => {
  IPC.listenOnMain("video:slice", async (event, payload) => {
    if (!payload) throw new Error("Payload is missing");

    // set indeterminate progress bar
    window.setProgressBar(2);

    const { directory, filepath, inpoint, outpoint } = payload;

    try {
      await ffmpegModel.createVideoSlice(
        filepath,
        path.join(directory, `slice-${globalObj.sliceNum++}.mp4`),
        inpoint,
        outpoint
      );
      Print.green("Sliced video");
      IPC.sendToRenderer(window, "success:slice", {
        message: "Video sliced successfully.",
      });
    } catch (error) {
      Print.red("Error slicing video:", error);
      IPC.sendToRenderer(window, "error:slice", {
        message: "Oops, the video couldn't be sliced.",
      });
    } finally {
      // reset progress bar
      window.setProgressBar(-1);
    }
  });
};

export const onShowDialog = async (window: Electron.BrowserWindow) => {
  IPC.listenOnMain("show:dialog", async (event, _) => {
    const basePath = path.join(app.getPath("videos"), "slices");

    // if default path does not exist, create it
    if (globalObj.slicesDir) {
      const defaultPath = path.join(basePath, globalObj.slicesDir);
      await FileManager.createDirectory(defaultPath, { overwrite: true });
    }
    try {
      const result = await dialog.showOpenDialog(window, {
        properties: ["openDirectory"],
        defaultPath: path.join(basePath, globalObj.slicesDir || "video-slices"),
      });

      // if user selects path
      if (!result.canceled) {
        Print.green("directory is", result.filePaths[0]);
        IPC.sendToRenderer(window, "selected:directory", {
          directory: result.filePaths[0],
        });

        const defaultPath = path.join(basePath, globalObj.slicesDir);

        // if user selects path different from default, immediately delete that folder
        if (result.filePaths[0] !== defaultPath) {
          await fs.rm(defaultPath, { recursive: true });
        }
      } else {
        Print.yellow("user cancelled dialog");
      }
    } catch (e) {
      Print.red("Error showing dialog:", e);
    }
  });
};

export const onDownloadToBrowser = (
  window: Electron.BrowserWindow,
  cb?: () => Promise<void> | void
) => {
  IPC.listenOnMain("video:download-to-browser", async (event, payload) => {
    try {
      const base64 = await VideoModel.getBlob(payload.filepath);
      // const blobUrl = URL.createObjectURL(file);
      Print.green("data string first 10 chars:", base64.slice(0, 10));
      IPC.sendToRenderer(window, "success:download-to-browser", {
        base64string: base64,
      });
      cb && (await cb());
    } catch (e) {
      Print.red("controllers.ts: Error downloading blob version of video:", e);
    }
  });
};

export const onRevealInExplorer = (window: Electron.BrowserWindow) => {
  IPCNew.listenOnMain("path:show", async (_, { directory }) => {
    shell.showItemInFolder(directory);
  });
};

export const onDownloadYoutubeURL = (
  window: Electron.BrowserWindow,
  cb: () => Promise<void>
) => {
  log.log(` In onDownloadYoutubeURL`);
  IPC.listenOnMain("video:upload", async (event, payload) => {
    if (!payload) throw new Error("Payload is missing");

    // set indeterminate progress bar
    window.setProgressBar(2);

    try {
      // 1a. send isdownloading event
      IPC.sendToRenderer(window, "video:isdownloading");

      // 1. try downloading video
      const videoUrl = ensureHttps(payload.url.trim());
      const destinationPath = VideoModel.videosPath;
      log.log(`downloading video to: ${destinationPath}`);
      const stdout = await ytdlpModel.downloadVideo(videoUrl, destinationPath);
      Print.cyan(stdout);
      log.log(` downloaded video!`);
      Print.green("Downloaded video");
      const webmpath = await VideoModel.renameVideoFile(videoUrl);
      Print.magenta("webm path:", webmpath);

      // 1b. if webm, compress video, convert to mp4
      IPC.sendToRenderer(window, "video:iscompressing");
      const filepath = await VideoModel.convertVideoToMp4(webmpath);
      globalObj.slicesDir = path.basename(filepath).split(".mp4")[0];
      const framerate = await ffmpegModel.ffprobe.getVideoFrameRate(filepath);
      Print.green("Framerate:", framerate);

      // 2. if video downloading succeeds, send success message to renderer
      IPC.sendToRenderer(window, "success:uploading", {
        message: "Video downloaded successfully.",
        filepath,
        framerate,
      });

      log.log(`video compressed successfully!`);

      await cb();
    } catch (error) {
      // 3. if video downloading fails, send error message to renderer
      Print.red("Error downloading video:", error);
      // log.error(`error downloading video! ${error}`);
      IPC.sendToRenderer(window, "error:uploading", {
        message: "Oops, the video couldn't be downloaded.",
      });
    } finally {
      // 4. reset progress bar
      window.setProgressBar(-1);
      window.show();
    }
  });
};
