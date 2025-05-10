import { create } from "zustand";
import { OpenedFile, TreeNode } from "../types";

interface FileState {
  zipFile: File | null;
  fileMap: Map<string, OpenedFile>;
  fileTree: TreeNode[];
  openFiles: string[];
  currentFilePath: string | null;
  isModified: boolean;

  // 액션
  setZipFile: (file: File | null) => void;
  setFileMap: (fileMap: Map<string, OpenedFile>) => void;
  setFileTree: (fileTree: TreeNode[]) => void;
  openFile: (filePath: string) => void;
  closeFile: (filePath: string) => void;
  setCurrentFilePath: (filePath: string | null) => void;
  setIsModified: (isModified: boolean) => void;
  clearAll: () => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  zipFile: null,
  fileMap: new Map(),
  fileTree: [],
  openFiles: [],
  currentFilePath: null,
  isModified: false,

  setZipFile: (file) => set({ zipFile: file }),
  setFileMap: (fileMap) => set({ fileMap }),
  setFileTree: (fileTree) => set({ fileTree }),

  openFile: (filePath) => {
    const { openFiles } = get();
    if (!openFiles.includes(filePath)) {
      set({
        openFiles: [...openFiles, filePath],
        currentFilePath: filePath,
      });
    } else {
      set({ currentFilePath: filePath });
    }
  },

  closeFile: (filePath) => {
    const { openFiles, currentFilePath } = get();
    const index = openFiles.indexOf(filePath);
    const nextFiles = openFiles.filter((f) => f !== filePath);

    set({
      openFiles: nextFiles,
      currentFilePath:
        filePath === currentFilePath
          ? index > 0
            ? openFiles[index - 1]
            : nextFiles.length > 0
            ? nextFiles[0]
            : null
          : currentFilePath,
    });
  },

  setCurrentFilePath: (filePath) => set({ currentFilePath: filePath }),
  setIsModified: (isModified) => set({ isModified }),

  clearAll: () =>
    set({
      zipFile: null,
      fileMap: new Map(),
      fileTree: [],
      openFiles: [],
      currentFilePath: null,
      isModified: false,
    }),
}));
