import JSZip from "jszip";
import { useFileStore } from "../store/fileStore";
import { useCallback, useState } from "react";
import { classifyFile } from "../lib/fileUtils";
import { OpenedFile, TreeNode } from "../types";

export function useZipHandler() {
  const { setZipFile, setFileMap, setFileTree, clearAll } = useFileStore();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const processZipFile = useCallback(
    async (file: File) => {
      if (!file) return;

      setIsLoading(true);
      setProgress(0);
      clearAll();
      setZipFile(file);

      try {
        const zipData = await readFileAsArrayBuffer(file);
        const zip = await JSZip.loadAsync(zipData);
        const fileEntries: { path: string; isDir: boolean }[] = [];
        const fileMap = new Map<string, OpenedFile>();

        Object.keys(zip.files).forEach((path) => {
          const zipEntry = zip.files[path];
          // __MACOSX 같은 메타 디렉토리 제외
          if (!path.startsWith("__MACOSX") && !path.startsWith(".")) {
            fileEntries.push({ path, isDir: zipEntry.dir });
          }
        });

        const totalFiles = fileEntries.filter((entry) => !entry.isDir).length;
        let processedFiles = 0;

        const batchSize = 100; // 한 번에 처리할 파일 수
        const nonDirEntries = fileEntries.filter((entry) => !entry.isDir);
      } catch (error) {
        // console.error(`파일 처리 오류 (${path}):`, error);
      }
    },
    [clearAll, setFileMap, setFileTree, setZipFile]
  );

  function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
}
