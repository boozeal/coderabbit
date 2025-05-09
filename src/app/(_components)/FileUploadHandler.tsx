"use client";

import { useCallback, useState } from "react";
import { OpenedFile } from "../utils/openedFile";
import JSZip from "jszip";
import * as monaco from "monaco-editor";

type TreeNode = {
  name: string;
  path: string;
  isDir: boolean;
  children?: TreeNode[];
};

export default function FileUploadHander({
  setFile,
  fileMap,
  setFileMap,
  setFileTree,
  setOpenFiles,
  isModified,
  setIsModified,
  setCurrentFilePath,
}: {
  fileMap: Map<string, OpenedFile>;
  setFile: (file: File | null) => void;
  setFileMap: (fileMap: Map<string, OpenedFile>) => void;
  setFileTree: (fileTree: TreeNode[]) => void;
  setOpenFiles: (openFiles: string[]) => void;
  isModified: boolean;
  setIsModified: (isModified: boolean) => void;
  setCurrentFilePath: (currentFilePath: string | null) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClear = () => {
    setFile(null);
    setFileName(null);
    setFileMap(new Map());
    setFileTree([]);
    setOpenFiles([]);
    setIsModified(false);
    setCurrentFilePath(null);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleClear();

    const file = e.dataTransfer.files[0];
    if (file) {
      const fileExtension = file.name.split(".").pop();
      if (fileExtension === "zip") {
        setFileName(file.name);
        setFile(file);
      } else {
        alert("Only zip files are allowed.");
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFile(file);
    }
  };

  const handleDownload = async () => {
    const models = monaco.editor.getModels();
    const modelMap = new Map<string, monaco.editor.ITextModel>();
    models.forEach((model) => {
      const path = model.uri.path;
      modelMap.set(path, model);
    });

    const zip = new JSZip();

    fileMap.forEach((openedFile, path) => {
      if (openedFile.type === "text") {
        const model = modelMap.get(`/${path}`);
        if (model) {
          zip.file(path, model.getValue()); // 수정된 내용
        } else if (openedFile.content) {
          zip.file(path, new TextDecoder().decode(openedFile.content)); // 원본 텍스트
        }
      } else if (openedFile.content) {
        zip.file(path, openedFile.content); // 이미지나 바이너리 파일
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="flex items-center justify-center gap-4 w-full h-[70px] border-1 border-[#202020]"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        id="fileInput"
        type="file"
        className="hidden"
        accept=".zip"
        onChange={handleFileChange}
      />
      <p
        className="text-gray-600"
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        {fileName
          ? `업로드된 파일: ${fileName}`
          : isDragging
          ? "파일을 놓으세요!"
          : "클릭하거나 드래그해서 파일을 업로드하세요"}
      </p>
      <button
        onClick={handleClear}
        disabled={!fileName}
        className={`${!fileName ? "opacity-50" : ""}`}
      >
        지우기
      </button>
      <button
        onClick={handleDownload}
        disabled={!isModified}
        className={`${!isModified ? "opacity-50" : ""}`}
      >
        다운로드
      </button>
    </div>
  );
}
