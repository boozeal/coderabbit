"use client";

import React from "react";
import Image from "next/image";

interface FileIconProps {
  fileName: string;
}

export function getFileIconDetails(fileName: string, isDir: boolean = false) {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "js":
      return { name: "javascript", label: "JS" };
    case "ts":
      return { name: "typescript", label: "TS" };
    case "tsx":
      return { name: "typescript-react", label: "TSX" };
    case "jsx":
      return { name: "javascript-react", label: "JSX" };
    case "json":
      return { name: "json", label: "JSON" };
    case "html":
      return { name: "html", label: "HTML" };
    case "css":
      return { name: "css", label: "CSS" };
    case "scss":
      return { name: "scss", label: "SCSS" };
    case "less":
      return { name: "less", label: "LESS" };
    case "md":
      return { name: "markdown", label: "MD" };
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return { name: "image", label: "이미지" };
    default:
      return { name: "file", label: "파일" };
  }
}

export default function FileIcon({ fileName }: FileIconProps) {
  //   const { name, label } = getFileIconDetails(fileName, isDir);

  // 다양한 아이콘이 없는 경우 기본 아이콘 및 텍스트 표시 방식
  return (
    <div className="flex items-center">
      <div className="w-5 h-5 mr-1 flex items-center justify-center">
        <Image src="/file.svg" alt="파일" width={16} height={16} priority />
      </div>
    </div>
  );
}
