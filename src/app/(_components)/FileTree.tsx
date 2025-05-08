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
        zip.forEach((relativePath, file) => {
          files.push({
            path: relativePath,
            isDir: file.dir,
          });
        });
        setFileTree(files);
      };
      reader.readAsArrayBuffer(zipFile);
    }
  }, [zipFile]);

  return (
    <div className="w-[200px] h-full border-2 border-gray-400 overflow-y-auto">
      <ul>
        {fileTree?.map((file, index) => (
          <li key={index}>
            <button onClick={() => onOpenFile(file.path)}>{file.path}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
