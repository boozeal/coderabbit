"use client";

import JSZip from "jszip";
import { useEffect, useState } from "react";

export default function FileTree({
  zipFile,
  onOpenFile,
  onZipParsed,
}: {
  zipFile: File | null;
  onOpenFile: (filePath: string) => void;
  onZipParsed: (fileMap: Map<string, Uint8Array>) => void;
}) {
  const [fileTree, setFileTree] = useState<{ path: string; isDir: boolean }[]>(
    []
  );

  useEffect(() => {
    if (zipFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const zip = await new JSZip().loadAsync(
          e.target?.result as ArrayBuffer
        );
        const files: { path: string; isDir: boolean }[] = [];
        const map = new Map<string, Uint8Array>();

        await Promise.all(
          Object.entries(zip.files).map(async ([path, file]) => {
            files.push({ path, isDir: file.dir });
            if (!file.dir) {
              const data = await file.async("uint8array");
              map.set(path, data);
            }
          })
        );

        setFileTree(files);
        onZipParsed(map);
      };
      reader.readAsArrayBuffer(zipFile);
    }
  }, [zipFile]);

  return (
    <div className="w-[200px] h-full border-2 border-gray-400 overflow-y-auto">
      <ul>
        {fileTree.map((file, idx) => (
          <li key={idx}>
            {!file.isDir && (
              <button onClick={() => onOpenFile(file.path)}>{file.path}</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
