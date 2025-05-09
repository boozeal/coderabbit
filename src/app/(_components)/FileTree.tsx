"use client";

import { useEffect, useState } from "react";

type TreeNode = {
  name: string;
  path: string;
  isDir: boolean;
  children?: TreeNode[];
};

function TreeItem({
  node,
  depth,
  onOpenFile,
}: {
  node: TreeNode;
  depth: number;
  onOpenFile: (filePath: string) => void;
}) {
  const [isDirOpen, setIsDirOpen] = useState(false);
  useEffect(() => {
    console.log(depth);
  }, []);

  return (
    <li style={{ paddingLeft: `${depth * 8}px` }}>
      {node.isDir ? (
        <div>
          <div
            onClick={() => setIsDirOpen((prev) => !prev)}
            className="cursor-pointer"
          >
            {isDirOpen ? "▼" : "▶"} {node.name}
          </div>
          {isDirOpen && node.children && (
            <ul>
              {node.children.map((child, idx) => (
                <TreeItem
                  key={idx}
                  node={child}
                  depth={depth + 1}
                  onOpenFile={onOpenFile}
                />
              ))}
            </ul>
          )}
        </div>
      ) : (
        <button
          onClick={() => onOpenFile(node.path)}
          className="text-left w-full"
        >
          📄 {node.name}
        </button>
      )}
    </li>
  );
}

export default function FileTree({
  nodes,
  onOpenFile,
}: {
  nodes: TreeNode[];
  onOpenFile: (filePath: string) => void;
}) {
  return (
    <div className="w-[200px] h-full border-2 border-gray-400 overflow-y-auto">
      <ul>
        {nodes.map((node, idx) => (
          <TreeItem key={idx} node={node} depth={0} onOpenFile={onOpenFile} />
        ))}
      </ul>
    </div>
  );
}
