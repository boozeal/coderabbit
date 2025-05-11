import { useEffect, useRef, useState, useCallback } from "react";
import * as monaco from "monaco-editor";
import { getOrCreateModel, detectLanguage } from "../lib/monaco/init";

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, wait);
  };
}

interface UseMonacoEditorOptions {
  filePath: string;
  content: string;
  language?: string;
  theme?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export function useMonacoEditor({
  filePath,
  content,
  language,
  theme = "vs-dark",
  readOnly = false,
  onChange,
}: UseMonacoEditorOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const model = getOrCreateModel(content, filePath);

    // 에디터 생성
    const editor = monaco.editor.create(containerRef.current, {
      model,
      language: language || detectLanguage(filePath),
      theme,
      readOnly,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: "on",
      wordWrap: "on",
      folding: true,
      tabSize: 2,
      renderWhitespace: "none",
    });

    editorRef.current = editor;
    setIsReady(true);

    return () => {
      editor.dispose();
      editorRef.current = null;
    };
  }, [filePath]);

  // 에디터 내용 변경 시 콜백
  useEffect(() => {
    if (!editorRef.current || !onChange) return;

    const debouncedOnChange = debounce((value: string) => {
      onChange(value);
    }, 300);

    const disposable = editorRef.current.onDidChangeModelContent(() => {
      const value = editorRef.current?.getValue() || "";
      debouncedOnChange(value);
    });

    return () => {
      disposable.dispose();
    };
  }, [onChange]);

  const setValue = useCallback((value: string) => {
    if (editorRef.current) {
      editorRef.current.setValue(value);
    }
  }, []);

  const getValue = useCallback(() => {
    return editorRef.current?.getValue() || "";
  }, []);

  return {
    containerRef,
    editor: editorRef.current,
    isReady,
    setValue,
    getValue,
  };
}
