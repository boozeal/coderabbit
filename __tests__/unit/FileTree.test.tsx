/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FileTree from "../../src/app/(_components)/file-tree/FileTree";
import { TreeNode } from "../../src/app/types";

// 가상화 훅을 모킹
jest.mock("../../src/app/hooks/useVirtualizedTree", () => ({
  useVirtualizedTree: jest.fn().mockImplementation((nodes) => {
    return {
      containerRef: { current: null },
      visibleItems: nodes.map((node: TreeNode) => ({ node, level: 0 })),
      totalHeight: nodes.length * 24,
      offsetY: 0,
      isExpanded: (path: string) => path.includes("expanded"),
      toggleNode: jest.fn(),
    };
  }),
}));

describe("FileTree 컴포넌트", () => {
  const mockNodes: TreeNode[] = [
    {
      name: "folder1",
      path: "folder1",
      isDir: true,
      children: [
        {
          name: "file1.txt",
          path: "folder1/file1.txt",
          isDir: false,
        },
      ],
    },
    {
      name: "file2.js",
      path: "file2.js",
      isDir: false,
    },
    {
      name: "expanded-folder",
      path: "expanded-folder",
      isDir: true,
      children: [
        {
          name: "file3.css",
          path: "expanded-folder/file3.css",
          isDir: false,
        },
      ],
    },
  ];

  const mockOnOpenFile = jest.fn();

  test("파일 트리가 올바르게 렌더링된다", () => {
    render(<FileTree nodes={mockNodes} onOpenFile={mockOnOpenFile} />);

    // 폴더와 파일 노드가 렌더링되었는지 확인
    expect(screen.getByText("folder1")).toBeInTheDocument();
    expect(screen.getByText("file2.js")).toBeInTheDocument();
    expect(screen.getByText("expanded-folder")).toBeInTheDocument();
  });

  test("파일 노드 클릭 시 onOpenFile 콜백이 호출된다", () => {
    render(<FileTree nodes={mockNodes} onOpenFile={mockOnOpenFile} />);

    // 파일 노드 클릭
    fireEvent.click(screen.getByText("file2.js"));

    // onOpenFile이 해당 파일 경로로 호출되었는지 확인
    expect(mockOnOpenFile).toHaveBeenCalledWith("file2.js");
  });

  test("폴더 노드에 올바른 확장 아이콘이 표시된다", () => {
    const { container } = render(
      <FileTree nodes={mockNodes} onOpenFile={mockOnOpenFile} />
    );

    // 폴더 노드 옆에 화살표 아이콘이 있는지 확인
    const folderNode = screen.getByText("folder1").parentElement?.parentElement;
    const expandedFolderNode =
      screen.getByText("expanded-folder").parentElement?.parentElement;

    // 닫힌 폴더와 열린 폴더의 아이콘이 다른지 확인
    expect(folderNode).toHaveTextContent("▶");
    expect(expandedFolderNode).toHaveTextContent("▼");
  });
});
