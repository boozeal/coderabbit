import * as monaco from "monaco-editor";
import { getExtension } from "../fileUtils";

// 언어 ID 매핑
const LANGUAGE_MAP: Record<string, string> = {
  ".js": "javascript",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".jsx": "javascript",
  ".json": "json",
  ".html": "html",
  ".css": "css",
  ".scss": "scss",
  ".less": "less",
  ".md": "markdown",
  ".py": "python",
  ".java": "java",
  ".c": "c",
  ".cpp": "cpp",
  ".go": "go",
  ".rb": "ruby",
  ".php": "php",
  ".rs": "rust",
  ".sql": "sql",
  ".xml": "xml",
  ".yaml": "yaml",
  ".yml": "yaml",
};

// 파일 확장자로부터 언어 ID 감지
export function detectLanguage(filePath: string): string {
  const ext = getExtension(filePath);
  return LANGUAGE_MAP[ext] || "plaintext";
}

// Monaco Editor 초기화
export function initMonaco(): void {
  // 에디터 기본 옵션 설정
  monaco.editor.EditorOptions.tabSize.defaultValue = 2;
  monaco.editor.EditorOptions.wordWrap.defaultValue = "on";

  // 테마 등록
  monaco.editor.defineTheme("customDark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#1E1E1E",
      "editor.lineHighlightBackground": "#2A2A2A",
      "editorLineNumber.foreground": "#666666",
      "editorLineNumber.activeForeground": "#BBBBBB",
    },
  });

  // 자동 완성 설정
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    jsx: monaco.languages.typescript.JsxEmit.React,
    allowSyntheticDefaultImports: true,
  });
}

// 모델 관리
export function getOrCreateModel(
  content: string,
  filePath: string
): monaco.editor.ITextModel {
  const uri = monaco.Uri.parse(`file:///${filePath}`);
  const language = detectLanguage(filePath);

  let model = monaco.editor.getModel(uri);
  if (model) {
    model.setValue(content);
    return model;
  }

  return monaco.editor.createModel(content, language, uri);
}
