"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import RefactoredFileTree from "./(_components)/file-tree/FileTree";
import EditorTabs from "./(_components)/editor/EditorTab";
import { useFileStore } from "./store/fileStore";

const MonacoEditor = dynamic(
  () => import("./(_components)/editor/MonacoEditor"),
  {
    ssr: false,
  }
);

const FileUploadHandler = dynamic(
  () => import("./(_components)/file-system/FileUploadHandler"),
  {
    ssr: false,
  }
);

export default function EditorPage() {
  const {
    fileTree,
    fileMap,
    openFiles,
    currentFilePath,
    openFile,
    closeFile,
    setCurrentFilePath,
    setIsModified,
  } = useFileStore();

  // 클라이언트 사이드에서만 Monaco 초기화
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("./lib/monaco/init").then(({ initMonaco }) => {
        initMonaco();
      });
    }
  }, []);

  // 현재 열려있는 파일
  const currentFile = currentFilePath
    ? fileMap.get(currentFilePath) || null
    : null;

  // 파일 내용 변경 핸들러
  const handleFileChange = () => {
    setIsModified(true);
  };
  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-screen flex flex-col bg-[#141414] text-[#828282]">
      <FileUploadHandler />
      <div className="flex flex-1 overflow-hidden">
        <RefactoredFileTree
          nodes={fileTree}
          onOpenFile={openFile}
          className="h-full"
        />
        <div className="flex flex-col flex-1 border-l border-[#202020] overflow-hidden">
          <EditorTabs
            openFiles={openFiles}
            currentFilePath={currentFilePath}
            onSelectTab={setCurrentFilePath}
            onCloseTab={closeFile}
          />
          <MonacoEditor
            file={currentFile}
            onChange={handleFileChange}
            theme="vs-dark"
          />
        </div>
      </div>
    </div>
  );
}
