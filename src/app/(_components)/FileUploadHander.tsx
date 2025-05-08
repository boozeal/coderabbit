"use client";

import { useCallback, useState } from "react";

export default function FileUploadHander({
  setFile,
  file,
}: {
  file: File | null;
  setFile: (file: File | null) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

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

  const handleDownload = () => {
    // 클라이언트 측에서 다운로드 처리
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleClear = () => {
    setFile(null);
    setFileName(null);
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
      <button onClick={handleDownload}>다운로드</button>
    </div>
  );
}
