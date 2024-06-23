import { VideoModel } from "./nodeUtils";
import { IPC, Print } from "./utils";
import { FFPROBEModel, YTDLPModel } from "./videoapi";

export const onDownloadToBrowser = (
  window: Electron.BrowserWindow,
  cb?: () => Promise<void> | void
) => {
  IPC.listenOnMain("video:download-to-browser", async (event, payload) => {
    try {
      const base64 = await VideoModel.getBlob(payload.filepath);
      // const blobUrl = URL.createObjectURL(file);
      Print.green("data string first 100 chars:", base64.slice(0, 100));
      IPC.sendToRenderer(window, "success:download-to-browser", {
        base64string: base64,
      });
      cb && (await cb());
    } catch (e) {
      Print.red("controllers.ts: Error downloading blob version of video:", e);
    }
  });
};

export const onDownloadYoutubeURL = (
  window: Electron.BrowserWindow,
  cb: () => Promise<void>
) => {
  IPC.listenOnMain("video:upload", async (event, payload) => {
    if (!payload) throw new Error("Payload is missing");

    // set indeterminate progress bar
    window.setProgressBar(2);

    // 1. try downloading video
    try {
      const stdout = await YTDLPModel.downloadVideo(payload.url);
      Print.cyan(stdout);

      const filepath = await VideoModel.renameVideoFile(payload.url);
      const framerate = await FFPROBEModel.getVideoFrameRate(filepath);
      Print.green("Framerate:", framerate);
      // 3. if video downloading succeeds, send success message to renderer
      IPC.sendToRenderer(window, "success:uploading", {
        message: "Video downloaded successfully.",
        filepath,
        framerate,
      });

      await cb();
    } catch (error) {
      Print.red("Error downloading video:", error);
      // 2. if video downloading fails, send error message to renderer
      IPC.sendToRenderer(window, "error:uploading", {
        message: "Oops, the video couldn't be downloaded.",
      });
    } finally {
      // 4. reset progress bar
      window.setProgressBar(-1);
    }
  });
};
