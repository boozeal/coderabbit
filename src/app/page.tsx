"use client";

import FileUploadHander from "./(_components)/FileUploadHander";
import FileTree from "./(_components)/FileTree";
import Tabs from "./(_components)/Tabs";
import Editor from "./(_components)/Editor";
import { useState } from "react";

export default function Home() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
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

  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-screen flex flex-col bg-black text-white">
      <FileUploadHander setFile={setZipFile} file={zipFile} />
      <div className="flex flex-1 flex-row">
        <FileTree
          zipFile={zipFile}
          onOpenFile={handleOpenFile}
          onZipParsed={setFileMap}
        />
        <div className="flex flex-col w-full">
          <Tabs
            openFiles={openFiles}
            onClose={handleCloseFile}
            onSelect={setCurrentFilePath}
            selectedFile={currentFilePath}
          />
          <Editor
            filePath={currentFilePath}
            fileData={
              currentFilePath ? fileMap.get(currentFilePath) : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
