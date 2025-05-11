"use client";

import React, { useMemo } from "react";
import { TreeNode } from "../../types";
import { useVirtualizedTree } from "../../hooks/useVirtualizedTree";

interface FileTreeProps {
  nodes: TreeNode[];
  onOpenFile: (filePath: string) => void;
  className?: string;
}

export default function RefactoredFileTree({
  nodes,
  onOpenFile,
  className = "",
}: FileTreeProps) {
  const {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    isExpanded,
    toggleNode,
  } = useVirtualizedTree(nodes, {
    itemHeight: 24, // 각 아이템의 높이
    containerHeight: 600, // 컨테이너 높이
    paddingTop: 8,
    paddingBottom: 8,
  });

  // 파일 아이콘 선택 함수
  const getFileIcon = (fileName: string, isDir: boolean) => {
    if (isDir) return "📁";

    const ext = fileName.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "js":
        return "📄 JS";
      case "ts":
      case "tsx":
        return "📄 TS";
      case "jsx":
        return "📄 JSX";
      case "json":
        return "📄 JSON";
      case "html":
        return "📄 HTML";
      case "css":
      case "scss":
      case "less":
        return "📄 CSS";
      case "md":
        return "📄 MD";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
        return "🖼️";
      default:
        return "📄";
    }
  };

  return (
    <div
      className={`w-[300px] overflow-y-auto ${className}`}
      ref={containerRef}
      style={{ height: "100%" }}
    >
      {/* 전체 높이를 위한 컨테이너 */}
      <div style={{ height: totalHeight, position: "relative" }}>
        {/* 가시 영역 아이템 */}
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ node, level, isVisible }) => (
            <div
              key={node.path}
              className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer text-sm`}
              style={{
                paddingLeft: `${(level + 1) * 12}px`,
                height: "24px",
                userSelect: "none",
              }}
              onClick={() =>
                node.isDir ? toggleNode(node.path) : onOpenFile(node.path)
              }
            >
              <span className="mr-1">
                {node.isDir && (
                  <span className="mr-1">
                    {isExpanded(node.path) ? "▼" : "▶"}
                  </span>
                )}
                {getFileIcon(node.name, node.isDir)}
              </span>
              <span className="truncate">{node.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
