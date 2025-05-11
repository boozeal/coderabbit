import { useState, useCallback, useRef, useEffect } from "react";
import { TreeNode } from "../types";

interface VirtualizedTreeOptions {
  itemHeight: number;
  containerHeight: number;
  paddingTop?: number;
  paddingBottom?: number;
}

interface FlattenedNode {
  node: TreeNode;
  level: number;
  isVisible: boolean;
}

export function useVirtualizedTree(
  rootNodes: TreeNode[],
  options: VirtualizedTreeOptions
) {
  const {
    itemHeight,
    containerHeight,
    paddingTop = 0,
    paddingBottom = 0,
  } = options;

  // 확장된 노드 상태 관리
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 노드 확장/축소 토글 함수
  const toggleNode = useCallback((nodePath: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodePath)) {
        next.delete(nodePath);
      } else {
        next.add(nodePath);
      }
      return next;
    });
  }, []);

  // 트리를 평탄화하여 가상화에 적합한 형태로 변환
  const flattenTree = useCallback(
    (nodes: TreeNode[], level = 0, parentExpanded = true): FlattenedNode[] => {
      return nodes.reduce<FlattenedNode[]>((acc, node) => {
        const isExpanded = expandedNodes.has(node.path);
        const isVisible = parentExpanded;

        acc.push({ node, level, isVisible });

        if (node.children && isExpanded) {
          acc.push(...flattenTree(node.children, level + 1, isVisible));
        }

        return acc;
      }, []);
    },
    [expandedNodes]
  );

  // 평탄화된 노드 목록 계산
  const flattenedNodes = flattenTree(rootNodes);
  const visibleNodes = flattenedNodes.filter((n) => n.isVisible);

  // 스크롤 관련 상태
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // 스크롤 이벤트 리스너 설정
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  // 현재 화면에 표시할 노드 계산
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
  const endIndex = Math.min(
    visibleNodes.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );

  // 화면에 표시할 노드 목록
  const visibleItems = visibleNodes.slice(startIndex, endIndex + 1);

  // 가상화 관련 스타일
  const totalHeight = visibleNodes.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    isExpanded: (path: string) => expandedNodes.has(path),
    toggleNode,
  };
}
