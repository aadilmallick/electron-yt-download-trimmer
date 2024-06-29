import { Print } from "@2022amallick/print-colors";

import { ipcMain, ipcRenderer } from "electron";

export class IPC {
  // implicit generic by providing channel type as T
  public static sendToMain<T extends Channels>(
    channel: T,
    payload?: IPCPayload<T>
  ) {
    ipcRenderer.send(channel, payload);
  }

  public static listenOnRenderer<T extends Channels>(
    channel: T,
    listener: (
      event: Electron.IpcRendererEvent,
      payload?: IPCPayload<T>
    ) => Promise<void> | void
  ) {
    ipcRenderer.on(channel, listener);
  }

  public static sendToRenderer<T extends Channels>(
    browserWindow: Electron.BrowserWindow,
    channel: T,
    payload?: IPCPayload<T>
  ) {
    browserWindow.webContents.send(channel, payload);
  }

  public static listenOnMain<T extends Channels>(
    channel: T,
    listener: (
      event: Electron.IpcMainEvent,
      payload?: IPCPayload<T>
    ) => Promise<void> | void
  ) {
    ipcMain.on(channel, listener);
  }

  public static handleEventFromMain<T extends Channels>(
    channel: T,
    cb: (payload: IPCPayloads[T]) => void | Promise<void>
  ) {
    IPC.listenOnRenderer(channel, (event, payload) => {
      cb(payload);
    });
  }
}

export class IPCNew {
  static async sendToMain<T extends Channels>(
    channel: T,
    payload?: IPCPayload<T>
  ) {
    const response: IPCReturnType<T> = await ipcRenderer.invoke(
      channel,
      payload
    );
    return response;
  }

  static async listenOnMain<T extends Channels>(
    channel: T,
    listener: (
      event: Electron.IpcMainEvent,
      payload?: IPCPayload<T>
    ) => Promise<IPCReturnType<T>>
  ) {
    ipcMain.handle(channel, listener);
  }
}

export type Channels =
  | "video:upload"
  | "video:compress"
  | "video:slice"
  | "error:uploading"
  | "success:uploading"
  | "video:download-to-browser"
  | "success:download-to-browser"
  | "show:dialog"
  | "selected:directory"
  | "success:slice"
  | "error:slice"
  | "video:clear"
  | "success:clear"
  | "error:clear"
  | "video:isdownloading"
  | "video:iscompressing"
  | "path:show";

export type IPCPayloads = {
  [K in Channels]: K extends "video:upload"
    ? { url: string }
    : K extends "error:uploading"
    ? { message: string }
    : K extends "success:slice"
    ? { message: string }
    : K extends "error:slice"
    ? { message: string }
    : K extends "success:clear"
    ? { message: string }
    : K extends "error:clear"
    ? { message: string }
    : K extends "success:uploading"
    ? { message: string; filepath: string; framerate: number }
    : K extends "video:download-to-browser"
    ? { filepath: string }
    : K extends "video:slice"
    ? { filepath: string; inpoint: number; outpoint: number; directory: string }
    : K extends "selected:directory"
    ? { directory: string }
    : K extends "path:show"
    ? { directory: string }
    : K extends "success:download-to-browser"
    ? { base64string: string }
    : void;
};

export type IPCReturns = {
  [K in Channels]: K extends "video:upload"
    ? { message: string; filepath: string; framerate: number }
    : void;
};

type IPCPayload<T extends Channels> = IPCPayloads[T];
type IPCReturnType<T extends Channels> = IPCReturns[T];
