import JSZip from "jszip";
import { useFileStore } from "../store/fileStore";
import { useCallback, useState } from "react";
import { classifyFile } from "../lib/fileUtils";
import { OpenedFile, TreeNode } from "../types";
import * as monaco from "monaco-editor";
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
        for (let i = 0; i < nonDirEntries.length; i += batchSize) {
          const batch = nonDirEntries.slice(i, i + batchSize);

          await Promise.all(
            batch.map(async ({ path }) => {
              try {
                const zipEntry = zip.files[path];
                if (!zipEntry) return;

                const blob = await zipEntry.async("blob");
                const file = new File([blob], path.split("/").pop() || "");

                // 파일 분류
                const fileType = await classifyFile(file);

                // 파일 내용 읽기
                const arrayBuffer = await blob.arrayBuffer();

                fileMap.set(path, {
                  name: path.split("/").pop() || "",
                  path,
                  content: new Uint8Array(arrayBuffer),
                  type: fileType,
                });

                // 진행 상황 업데이트
                processedFiles++;
                setProgress(Math.round((processedFiles / totalFiles) * 100));
              } catch (error) {
                console.error(`파일 처리 오류 (${path}):`, error);
              }
            })
          );
        }

        // 파일 트리 구축
        const fileTree = buildFileTree(fileEntries);

        // 상태 업데이트
        setFileMap(fileMap);
        setFileTree(fileTree);
        setProgress(100);
      } catch (error) {
        console.error("ZIP 파일 처리 오류:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearAll, setFileMap, setFileTree, setZipFile]
  );

  const downloadZipFile = useCallback(
    async (
      fileMap: Map<string, OpenedFile>,
      fileName: string,
      monacoModels: monaco.editor.ITextModel[]
    ) => {
      setIsLoading(true);
      setProgress(0);

      try {
        const zip = new JSZip();
        const totalFiles = fileMap.size;
        let processedFiles = 0;

        // 모델 데이터를 빠르게 접근하기 위한 맵 구성
        const modelMap = new Map<string, monaco.editor.ITextModel>();
        monacoModels.forEach((model) => {
          const path = model.uri.path.substring(1); // 앞의 '/' 제거
          modelMap.set(path, model);
        });

        // 각 파일 처리
        fileMap.forEach((openedFile, path) => {
          if (openedFile.type === "text") {
            // 텍스트 파일의 경우 Monaco 모델에서 최신 내용 가져오기
            const model = modelMap.get(path);
            if (model) {
              zip.file(path, model.getValue());
            } else if (openedFile.content) {
              zip.file(path, new TextDecoder().decode(openedFile.content));
            }
          } else if (openedFile.content) {
            // 이미지나 바이너리 파일은 원래 내용 사용
            zip.file(path, openedFile.content);
          }

          processedFiles++;
          setProgress(Math.round((processedFiles / totalFiles) * 100));
        });

        // ZIP 파일 생성
        const content = await zip.generateAsync(
          {
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: { level: 6 },
          },
          (metadata) => {
            setProgress(Math.round(metadata.percent));
          }
        );

        // 다운로드 링크 생성 및 클릭
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName.replace(/\.zip$/i, "")}.zip`;
        a.click();
        URL.revokeObjectURL(url);

        setProgress(100);
        return true;
      } catch (error) {
        console.error("ZIP 파일 다운로드 오류:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    processZipFile,
    downloadZipFile,
    isLoading,
    progress,
  };
}
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// 파일 트리 구축 함수
function buildFileTree(files: { path: string; isDir: boolean }[]): TreeNode[] {
  const root: TreeNode[] = [];

  files.forEach(({ path, isDir }) => {
    const parts = path.split("/").filter((part) => part !== "");
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isLastPart = index === parts.length - 1;
      const existingNode = currentLevel.find((node) => node.name === part);

      if (existingNode) {
        if (!isLastPart) {
          currentLevel = existingNode.children || [];
        }
      } else {
        const newNode: TreeNode = {
          name: part,
          path: parts.slice(0, index + 1).join("/"),
          isDir: !isLastPart || isDir,
          children: !isLastPart || isDir ? [] : undefined,
        };

        currentLevel.push(newNode);

        if (!isLastPart) {
          currentLevel = newNode.children || [];
        }
      }
    });
  });
  // 파일/폴더 정렬 (폴더 먼저, 그 다음 파일)
  const sortTreeNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
      })
      .map((node) => {
        if (node.children) {
          return { ...node, children: sortTreeNodes(node.children) };
        }
        return node;
      });
  };
  return sortTreeNodes(root);
}
