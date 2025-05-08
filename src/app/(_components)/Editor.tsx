"use client";

import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { isImageFile, isTextFile, isBinaryFile } from "../utils/classifyFile";

export default function Editor({ file }: { file: File | null }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [fileType, setFileType] = useState<"image" | "text" | "binary" | null>(
    null
  );
  const [fileContent, setFileContent] = useState<Uint8Array | null>(null);

  // Determine file type and read content
  useEffect(() => {
    if (!file) return;

    const classifyAndRead = async () => {
      if (await isImageFile(file)) {
        setFileType("image");
        const buffer = await file.arrayBuffer();
        setFileContent(new Uint8Array(buffer));
      } else if (await isTextFile(file)) {
        setFileType("text");
        const buffer = await file.arrayBuffer();
        setFileContent(new Uint8Array(buffer));
      } else {
        setFileType("binary");
        setFileContent(null);
      }
    };

    classifyAndRead();
  }, [file]);

  // Monaco Editor setup
  useEffect(() => {
    if (!editorRef.current || !file || fileType !== "text" || !fileContent)
      return;

    const text = new TextDecoder().decode(fileContent);
    const uri = monaco.Uri.parse(`file:///${file.name}`);

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
  }, [file, fileType, fileContent]);

  if (!file) {
    return <div className="flex-1">No file selected</div>;
  }

  if (fileType === "image" && fileContent) {
    const blob = new Blob([fileContent]);
    const src = URL.createObjectURL(blob);
    return (
      <img src={src} alt={file.name} className="object-contain max-h-full" />
    );
  }

  if (fileType === "binary") {
    return <div className="p-4">Binary file (not editable)</div>;
  }

  return <div className="flex-1" ref={editorRef} />;
}
