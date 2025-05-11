"use client";

import React, { memo } from "react";
import FileIcon from "../common/FileIcon";

interface EditorTabsProps {
  openFiles: string[];
  currentFilePath: string | null;
  onSelectTab: (filePath: string) => void;
  onCloseTab: (filePath: string) => void;
}

export default memo(function EditorTabs({
  openFiles,
  currentFilePath,
  onSelectTab,
  onCloseTab,
}: EditorTabsProps) {
  if (openFiles.length === 0) return null;

  return (
    <div className="flex overflow-x-auto text-sm">
      {openFiles.map((filePath) => {
        const fileName = filePath.split("/").pop() || "";
        const isActive = currentFilePath === filePath;

        return (
          <div
            key={filePath}
            className={`
              flex items-center min-w-[100px] max-w-[200px] h-[40px] px-2
              ${
                isActive
                  ? "bg-[#1E1E1E] text-[#EBCB8B]"
                  : "border-1 border-[#202020]"
              }
              border-r border-gray-700 group
            `}
          >
            <div
              className="flex items-center flex-1 overflow-hidden cursor-pointer"
              onClick={() => onSelectTab(filePath)}
            >
              <FileIcon fileName={fileName} />
              <span className="truncate">{fileName}</span>
            </div>

            <button
              className="ml-2 w-5 h-5 flex items-center justify-center rounded-full 
                         opacity-0 group-hover:opacity-100 hover:bg-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(filePath);
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
});
