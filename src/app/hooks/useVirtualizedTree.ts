import { useState, useCallback, useRef, useEffect, RefObject } from "react";
import { TreeNode } from "../types";

interface VirtualizedTreeOptions {
  itemHeight: number;
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
  const { itemHeight } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600);
  const [scrollTop, setScrollTop] = useState(0);

  // containerHeight 감지
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  // 스크롤 핸들러
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (el) setScrollTop(el.scrollTop);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // 확장 상태
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = useCallback((nodePath: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodePath)) next.delete(nodePath);
      else next.add(nodePath);
      return next;
    });
  }, []);

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

  const flattenedNodes = flattenTree(rootNodes);
  const visibleNodes = flattenedNodes.filter((n) => n.isVisible);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
  const endIndex = Math.min(
    visibleNodes.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight + 5)
  );

  const visibleItems = visibleNodes.slice(startIndex, endIndex + 1);
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
