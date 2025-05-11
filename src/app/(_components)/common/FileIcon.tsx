"use client";

import React from "react";
import Image from "next/image";

interface FileIconProps {
  fileName: string;
  isDir?: boolean;
}

export function getFileIconDetails(fileName: string, isDir: boolean = false) {
  if (isDir) {
    return { name: "folder", imgSrc: "/icons/folder_type_src.svg" };
  }

  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "js":
      return { name: "javascript", imgSrc: "/icons/file_type_js.svg" };
    case "ts":
      return { name: "typescript", imgSrc: "/icons/file_type_typescript.svg" };
    case "tsx":
      return {
        name: "typescript-react",
        imgSrc: "/icons/file_type_reactts.svg",
      };
    case "jsx":
      return {
        name: "javascript-react",
        imgSrc: "/icons/file_type_reactjs.svg",
      };
    case "json":
      return { name: "json", imgSrc: "/icons/file_type_json.svg" };
    case "html":
      return { name: "html", imgSrc: "/icons/file_type_html.svg" };
    case "css":
      return { name: "css", imgSrc: "/icons/file_type_css.svg" };
    case "scss":
      return { name: "scss", imgSrc: "/icons/file_type_scss.svg" };
    case "less":
      return { name: "less", imgSrc: "/icons/file_type_less.svg" };
    case "md":
      return { name: "markdown", imgSrc: "/icons/file_type_markdown.svg" };
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return { name: "image", imgSrc: "/icons/file_type_image.svg" };
    case "svg":
      return { name: "svg", imgSrc: "/icons/file_type_svg.svg" };
    default:
      return { name: "file", imgSrc: "/icons/default_file.svg" };
  }
}

export default function FileIcon({ fileName, isDir = false }: FileIconProps) {
  const { name, imgSrc } = getFileIconDetails(fileName, isDir);

  // 다양한 아이콘이 없는 경우 기본 아이콘 및 텍스트 표시 방식
  return (
    <div className="flex items-center">
      <div className="w-5 h-5 mr-1 flex items-center justify-center">
        <Image src={imgSrc} alt={name} width={16} height={16} priority />
      </div>
    </div>
  );
}
