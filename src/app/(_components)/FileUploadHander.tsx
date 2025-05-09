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
  file,
  setFileMap,
  setFileTree,
  setOpenFiles,
  isModified,
}: {
  file: File | null;
  setFile: (file: File | null) => void;
  setFileMap: (fileMap: Map<string, OpenedFile>) => void;
  setFileTree: (fileTree: TreeNode[]) => void;
  setOpenFiles: (openFiles: string[]) => void;
  isModified: boolean;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClear = () => {
    setFile(null);
    setFileName(null);
    setFileMap(new Map());
    setFileTree([]);
    setOpenFiles([]);
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
    const zip = new JSZip();

    const models = monaco.editor.getModels();

    models.forEach((model) => {
      const path = model.uri.path;
      const content = model.getValue();
      const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
      zip.file(normalizedPath, content);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modified_project.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="flex items-center justify-center gap-4 w-full h-[70px] border-2 border-gray-400"
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
      <button onClick={handleClear}>지우기</button>
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
