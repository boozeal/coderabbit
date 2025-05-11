"use client";

import React, { memo, useEffect } from "react";
import { useMonacoEditor } from "../../hooks/useMonacoEditor";
import { OpenedFile } from "../../types";

interface MonacoEditorProps {
  file: OpenedFile | null;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  theme?: string;
}

export default memo(function MonacoEditor({
  file,
  onChange,
  readOnly = false,
  theme = "vs-dark",
}: MonacoEditorProps) {
  // 파일 내용을 텍스트로 변환
  const getFileContent = (): string => {
    if (!file || !file.content) return "";
    return file.type === "text" ? new TextDecoder().decode(file.content) : "";
  };

  const { containerRef, isReady, editor, setValue } = useMonacoEditor({
    filePath: file?.path || "",
    content: getFileContent(),
    readOnly,
    theme,
    onChange,
  });

  // 에디터 내용 업데이트 (파일이 변경된 경우)
  useEffect(() => {
    if (file && file.content && file.type === "text") {
      const content = new TextDecoder().decode(file.content);
      setValue(content);
    }
  }, [file?.path, setValue]);

  // 파일이 없는 경우
  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        파일을 선택하세요
      </div>
    );
  }

  // 이미지 파일인 경우
  if (file.type === "image" && file.content) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#202020]">
        <img
          src={URL.createObjectURL(new Blob([file.content]))}
          alt={file.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  // 바이너리 파일인 경우
  if (file.type === "binary") {
    return (
      <div className="flex-1 p-4 bg-[#202020] text-white text-sm">
        <h3 className="text-lg font-medium">바이너리 파일 (편집 불가)</h3>
        <p>파일 경로: {file.path}</p>
        <p>파일 이름: {file.name}</p>
      </div>
    );
  }

  // 텍스트 에디터 렌더링
  return (
    <div className="flex-1 relative">
      <div ref={containerRef} className="absolute inset-0" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70">
          로딩 중...
        </div>
      )}
    </div>
  );
});
