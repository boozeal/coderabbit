"use client";

import { useState } from "react";

type TreeNode = {
  name: string;
  path: string;
  isDir: boolean;
  children?: TreeNode[];
};

function TreeItem({
  node,
  onOpenFile,
}: {
  node: TreeNode;
  onOpenFile: (filePath: string) => void;
}) {
  const [isDirOpen, setIsDirOpen] = useState(false);

  return (
    <li className="px-2">
      {node.isDir ? (
        <div>
          <div
            onClick={() => setIsDirOpen((prev) => !prev)}
            className={`cursor-pointer ${isDirOpen ? "text-[#88C0D0]" : ""}`}
          >
            <span className="text-white">{isDirOpen ? "▼" : "▶"}</span>{" "}
            {node.name}
          </div>
          {isDirOpen && node.children && (
            <ul className="border-l border-gray-200 mx-2">
              {node.children.map((child, idx) => (
                <TreeItem key={idx} node={child} onOpenFile={onOpenFile} />
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
    <div className="w-[300px] min-h-screen border-2 border-gray-400 overflow-y-auto">
      <ul className="-ml-2">
        {nodes.map((node, idx) => (
          <TreeItem key={idx} node={node} onOpenFile={onOpenFile} />
        ))}
      </ul>
    </div>
  );
}
