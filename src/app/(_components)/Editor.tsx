"use client";

import { useEffect, useState } from "react";
import * as monaco from "monaco-editor";

export default function Editor({
  fileContent,
  fileType,
}: {
  fileContent: string;
  fileType: string;
}) {
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    // monaco editor를 클라이언트 사이드에서만 로드되도록 변경
    if (fileType.startsWith("text/")) {
      import("monaco-editor").then((monaco) => {
        const editorInstance = monaco.editor.create(
          document.getElementById("editor")!,
          {
            value: fileContent,
            language: "plaintext",
            automaticLayout: true,
          }
        );
        setEditor(editorInstance);

        return () => {
          editorInstance.dispose();
        };
      });
    }
  }, [fileContent, fileType]);

  if (fileType.startsWith("image/")) {
    return (
      <img src={fileContent} alt="file content" className="w-full h-full" />
    );
  }
  return (
    <div id="editor" className="w-full h-full border-2 border-gray-400"></div>
  );
}
