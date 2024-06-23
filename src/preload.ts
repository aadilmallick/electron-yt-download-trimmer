// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from "electron";
import { Channels, IPC, IPCPayloads, Print } from "./backend/utils";

const appApi = {
  downloadYoutubeURL(url: string) {
    IPC.sendToMain("video:upload", { url });
  },

  downloadToBrowser(filepath: string) {
    IPC.sendToMain("video:download-to-browser", { filepath });
  },

  handleEvent: IPC.handleEventFromMain,
} as const;

contextBridge.exposeInMainWorld("appApi", appApi);

export type AppApi = typeof appApi;
