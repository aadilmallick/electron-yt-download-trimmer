import { create } from "zustand";

type Store = {
  filePath: string;
  setFilePath: (filePath: string) => void;
  videoFrameRate: number;
  setVideoFrameRate: (frameRate: number) => void;
};

export const useApplicationStore = create<Store>()((set) => ({
  filePath: "",
  setFilePath: (filePath: string) => set((state) => ({ filePath })),
  videoFrameRate: 30,
  setVideoFrameRate: (frameRate: number) =>
    set((state) => ({ videoFrameRate: frameRate })),
}));
