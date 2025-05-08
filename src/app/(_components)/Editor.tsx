"use client";

import { useEffect, useState } from "react";
import * as monaco from "monaco-editor";

export default function Editor({
  filePath,
  fileData,
}: {
  filePath: string | null;
  fileData: Uint8Array | undefined;
}) {
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);

  return (
    <div id="editor" className="w-full h-full border-2 border-gray-400"></div>
  );
}
