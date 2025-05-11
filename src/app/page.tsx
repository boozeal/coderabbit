"use client";

import { useEffect, useState } from "react";
import JSZip from "jszip";
import { createOpenedFile, OpenedFile } from "./utils/openedFile";
import dynamic from "next/dynamic";
import RefactoredFileTree from "./(_components)/file-tree/FileTree";
import EditorTabs from "./(_components)/editor/EditorTab";
const Editor = dynamic(() => import("./(_components)/Editor"), {
  ssr: false,
});

const FileUploadHandler = dynamic(
  () => import("./(_components)/file-system/FileUploadHandler"),
  {
    ssr: false,
  }
);

type TreeNode = {
  name: string;
  path: string;
  isDir: boolean;
  children?: TreeNode[];
};

export default function Home() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [fileMap, setFileMap] = useState<Map<string, OpenedFile>>(new Map());
  const [isModified, setIsModified] = useState(false);

  const handleCloseFile = (filePath: string) => {
    setOpenFiles((prev) => {
      const index = prev.indexOf(filePath);
      const next = prev.filter((f) => f !== filePath);

      setCurrentFilePath(
        index > 0 ? prev[index - 1] : next.length > 0 ? next[0] : null
      );

      return next;
    });
  };

  const handleOpenFile = (filePath: string) => {
    setOpenFiles((prev) => {
      if (!prev.includes(filePath)) {
        return [...prev, filePath];
      }
      return prev;
    });
    setCurrentFilePath(filePath);
  };

  const buildTree = (files: { path: string; isDir: boolean }[]): TreeNode[] => {
    const root: TreeNode[] = [];

    files.forEach(({ path, isDir }) => {
      const parts = path
        .split("/")
        .filter(
          (part) =>
            part !== "" && !part.startsWith(".") && !part.startsWith("__MACOSX")
        );
      let currentLevel = root;

      parts.forEach((part, index) => {
        const existingNode = currentLevel.find((node) => node.name === part);

        if (existingNode) {
          currentLevel = existingNode.children!;
        } else {
          const newNode: TreeNode = {
            name: part,
            path: path,
            isDir: index < parts.length - 1 || isDir,
            children: [],
          };
          currentLevel.push(newNode);
          currentLevel = newNode.children!;
        }
      });
    });

    return root;
  };

  useEffect(() => {
    if (zipFile) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const zip = await new JSZip().loadAsync(
          e.target?.result as ArrayBuffer
        );
        const files: { path: string; isDir: boolean }[] = [];
        const map = new Map<string, OpenedFile>();

        await Promise.all(
          Object.entries(zip.files).map(async ([path, zipEntry]) => {
            files.push({ path, isDir: zipEntry.dir });

            if (!zipEntry.dir) {
              const blob = await zipEntry.async("blob");
              const file = new File([blob], path); // create File from blob
              const openedFile = await createOpenedFile(file, path);
              map.set(path, openedFile);
            }
          })
        );

        const tree = buildTree(files);
        setFileTree(tree);
        setFileMap(map);
      };

      reader.readAsArrayBuffer(zipFile);
    }
  }, [zipFile]);

  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-screen flex flex-col bg-[#141414] text-[#828282]">
      <FileUploadHandler />
      <div className="flex flex-1 overflow-hidden">
        <RefactoredFileTree
          nodes={fileTree}
          onOpenFile={handleOpenFile}
          className="h-full"
        />
        <div className="flex flex-col flex-1 border-l border-[#202020] overflow-hidden">
          <EditorTabs
            openFiles={openFiles}
            currentFilePath={currentFilePath}
            onSelectTab={setCurrentFilePath}
            onCloseTab={handleCloseFile}
          />
          <Editor
            file={currentFilePath ? fileMap.get(currentFilePath) ?? null : null}
            setIsModified={setIsModified}
          />
        </div>
      </div>
    </div>
  );
}
