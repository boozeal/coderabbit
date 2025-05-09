"use client";

type TreeNode = {
  name: string;
  path: string;
  isDir: boolean;
  children?: TreeNode[];
};

export default function FileTree({
  nodes,
  onOpenFile,
}: {
  nodes: TreeNode[];
  onOpenFile: (filePath: string) => void;
}) {
  const renderTree = (nodes: TreeNode[], depth: number = 0) => {
    return (
      <div className={`pl-${depth * 10}`}>
        <ul>
          {nodes.map((node, idx) => (
            <li key={idx}>
              {node.isDir ? (
                <div>
                  <span>{node.name}</span>
                  {node.children && renderTree(node.children, depth + 1)}
                </div>
              ) : (
                <button onClick={() => onOpenFile(node.path)}>
                  {node.name}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="w-[200px] h-full border-2 border-gray-400 overflow-y-auto">
      {renderTree(nodes, 0)}
    </div>
  );
}
