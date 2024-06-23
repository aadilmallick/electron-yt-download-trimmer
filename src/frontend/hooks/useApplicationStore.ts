import { create } from "zustand";

type Store = {
  filePath: string;
  setFilePath: (filePath: string) => void;
};

export const useApplicationStore = create<Store>()((set) => ({
  filePath: "",
  setFilePath: (filePath: string) => set((state) => ({ filePath })),
}));
