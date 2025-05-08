"use client";

import { useCallback, useState } from "react";

export default function FileUploadHander() {
  const [file, setFile] = useState<File | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-[70px] border-2 border-gray-400"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input type="file" onChange={handleFileChange} />
      {file && <p>{file.name}</p>}
      <button onClick={handleDownload}>다운로드</button>
    </div>
  );
}
