"use client";

import FileUploadHander from "./(_components)/FileUploadHander";
import FileTree from "./(_components)/FileTree";
import Tabs from "./(_components)/Tabs";
import Editor from "./(_components)/Editor";
import { useEffect, useState } from "react";
import JSZip from "jszip";

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
  const [fileMap, setFileMap] = useState<Map<string, Uint8Array>>(new Map());

  const handleCloseFile = (filePath: string) => {
    setOpenFiles(openFiles.filter((f) => f !== filePath));
    if (currentFilePath === filePath) {
      setCurrentFilePath(openFiles.find((f) => f !== filePath) || null);
    }
  };

  const handleOpenFile = (filePath: string) => {
    if (!openFiles.includes(filePath)) {
      setOpenFiles([...openFiles, filePath]);
    }
    setCurrentFilePath(filePath);
  };

  const buildTree = (files: { path: string; isDir: boolean }[]): TreeNode[] => {
    const root: TreeNode[] = [];

    files.forEach(({ path, isDir }) => {
      const parts = path.split("/");
      let currentLevel = root;

      parts.forEach((part, index) => {
        const existingNode = currentLevel.find((node) => node.name === part);

        if (existingNode) {
          currentLevel = existingNode.children!;
        } else {
          const newNode: TreeNode = {
            name: part,
            path: parts.slice(0, index + 1).join("/"),
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
        const map = new Map<string, Uint8Array>();

        await Promise.all(
          Object.entries(zip.files).map(async ([path, file]) => {
            files.push({ path, isDir: file.dir });
            if (!file.dir) {
              const data = await file.async("uint8array");
              map.set(path, data);
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
    <div className="w-full max-w-[1200px] mx-auto min-h-screen flex flex-col bg-black text-white">
      <FileUploadHander setFile={setZipFile} file={zipFile} />
      <div className="flex flex-1 flex-row">
        <FileTree nodes={fileTree} onOpenFile={handleOpenFile} />
        <div className="flex flex-col w-full">
          <Tabs
            openFiles={openFiles}
            onClose={handleCloseFile}
            onSelect={setCurrentFilePath}
            selectedFile={currentFilePath}
          />
          {/* <Editor
            file={currentFilePath ? fileMap.get(currentFilePath) : null}
          /> */}
        </div>
      </div>
    </div>
  );
}
