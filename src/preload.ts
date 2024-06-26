// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from "electron";
import { IPC, IPCNew, IPCPayloads } from "./backend/utils";

const appApi = {
  downloadYoutubeURL(url: string) {
    IPC.sendToMain("video:upload", { url });
  },

  downloadToBrowser(filepath: string) {
    IPC.sendToMain("video:download-to-browser", { filepath });
  },

  showDialog: () => {
    IPC.sendToMain("show:dialog");
  },

  clearVideos: () => {
    IPC.sendToMain("video:clear");
  },

  uploadSlice: (payload: IPCPayloads["video:slice"]) => {
    IPC.sendToMain("video:slice", payload);
  },

  revealInExplorer: (path: string) => {
    IPCNew.sendToMain("path:show", { directory: path });
  },

  handleEvent: IPC.handleEventFromMain,
} as const;

contextBridge.exposeInMainWorld("appApi", appApi);

export type AppApi = typeof appApi;
