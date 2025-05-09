"use client";

import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { OpenedFile } from "../utils/openedFile";

export default function Editor({ file }: { file: OpenedFile | null }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Monaco Editor setup
  useEffect(() => {
    if (!editorRef.current || !file || file.type !== "text" || !file.content)
      return;

    const text = new TextDecoder().decode(file.content);
    const uri = monaco.Uri.parse(`file:///${file.path}`);

    console.log("uri = ", uri);
    let model = monaco.editor.getModel(uri);
    if (!model) {
      model = monaco.editor.createModel(text, undefined, uri);
    }

    if (!editorInstance) {
      const instance = monaco.editor.create(editorRef.current, {
        model,
        theme: "vs-dark",
        automaticLayout: true,
      });
      setEditorInstance(instance);
    } else {
      editorInstance.setModel(model);
    }

    return () => {
      model?.dispose();
    };
  }, [file]);

  if (!file) {
    return <div className="flex-1 p-4">No file selected</div>;
  }

  if (file.type === "image" && file.content) {
    const blob = new Blob([file.content]);
    const src = URL.createObjectURL(blob);
    return (
      <img
        src={src}
        alt={file.name}
        className="object-contain max-h-full max-w-full mx-auto"
      />
    );
  }

  if (file.type === "binary") {
    return (
      <div className="p-4">
        Binary file (not editable)
        <span>{file.path}</span>
        <span>{file.type}</span>
        <span>{file.content}</span>
      </div>
    );
  }

  return <div className="flex-1" ref={editorRef} />;
}
