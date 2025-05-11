"use client";

import React, { useCallback, useState } from "react";
import { useZipHandler } from "../../hooks/useZipHandler";
import { useFileStore } from "../../store/fileStore";
import * as monaco from "monaco-editor";

export default function FileUploadHandler() {
  const [isDragging, setIsDragging] = useState(false);
  const { processZipFile, downloadZipFile, isLoading, progress } =
    useZipHandler();
  const { zipFile, fileMap, isModified, clearAll } = useFileStore();

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop()?.toLowerCase();
      if (fileExt !== "zip") {
        alert("ZIP 파일만 업로드할 수 있습니다.");
        return;
      }

      try {
        await processZipFile(file);
      } catch (error) {
        alert("ZIP 파일 처리 중 오류가 발생했습니다.");
        console.error(error);
      }
    },
    [processZipFile]
  );

  // 파일 선택 이벤트 핸들러
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop()?.toLowerCase();
      if (fileExt !== "zip") {
        alert("ZIP 파일만 업로드할 수 있습니다.");
        return;
      }

      try {
        await processZipFile(file);
      } catch (error) {
        alert("ZIP 파일 처리 중 오류가 발생했습니다.");
        console.error(error);
      }
    },
    [processZipFile]
  );

  // 파일 다운로드 핸들러
  const handleDownload = useCallback(async () => {
    if (!zipFile || !isModified) return;

    try {
      // 모나코 에디터 모델 가져오기
      const models = monaco.editor.getModels();

      await downloadZipFile(fileMap, zipFile.name, models);
    } catch (error) {
      alert("ZIP 파일 다운로드 중 오류가 발생했습니다.");
      console.error(error);
    }
  }, [zipFile, fileMap, isModified, downloadZipFile]);

  // 업로드 취소 및 초기화
  const handleClear = useCallback(() => {
    clearAll();
  }, [clearAll]);

  return (
    <div
      className={`
        flex items-center justify-between px-4 py-3 border-b border-[#202020]
        ${isDragging ? "bg-[#1E1E1E]" : "bg-[#141414]"}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center">
        <input
          id="file-upload"
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          className="hidden"
        />

        <label
          htmlFor="file-upload"
          className="flex items-center text-gray-300 cursor-pointer hover:text-white"
        >
          <span className="mr-2">📁</span>
          {zipFile
            ? zipFile.name
            : isDragging
            ? "파일을 놓으세요!"
            : "클릭하거나 드래그해서 ZIP 파일을 업로드하세요"}
        </label>
      </div>

      <div className="flex items-center gap-2">
        {isLoading && (
          <div className="flex items-center">
            <div className="w-24 h-2 bg-gray-600 rounded overflow-hidden mr-2">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{progress}%</span>
          </div>
        )}

        <button
          className="px-3 py-1 bg-[#202020] text-white rounded disabled:opacity-50"
          onClick={handleClear}
          disabled={!zipFile || isLoading}
        >
          지우기
        </button>

        <button
          className="px-3 py-1 bg-[#202020] text-white rounded disabled:opacity-50"
          onClick={handleDownload}
          disabled={!isModified || isLoading || !zipFile}
        >
          다운로드
        </button>
      </div>
    </div>
  );
}
