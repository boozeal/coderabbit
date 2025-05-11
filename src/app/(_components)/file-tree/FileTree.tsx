"use client";

import React, { useMemo } from "react";
import { TreeNode } from "../../types";
import { useVirtualizedTree } from "../../hooks/useVirtualizedTree";
import FileIcon from "../common/FileIcon";

interface FileTreeProps {
  nodes: TreeNode[];
  onOpenFile: (filePath: string) => void;
  className?: string;
}

export default function FileTree({
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
          {visibleItems.map(({ node, level }) => (
            <div
              key={node.path}
              className={`flex items-center py-1 px-2 hover:bg-gray-700 hover:text-white cursor-pointer text-sm`}
              style={{
                paddingLeft: `${(level + 1) * 12}px`,
                height: "24px",
                userSelect: "none",
              }}
              onClick={() =>
                node.isDir ? toggleNode(node.path) : onOpenFile(node.path)
              }
            >
              <span className="mr-1 flex items-center">
                {node.isDir ? (
                  <span className="mr-1">
                    {isExpanded(node.path) ? "▼" : "▶"}
                  </span>
                ) : (
                  <FileIcon fileName={node.name} />
                )}
              </span>
              <span className="truncate">{node.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
