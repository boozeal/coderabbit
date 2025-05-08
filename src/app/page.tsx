"use client";

import FileUploadHander from "./(_components)/FileUploadHander";
import FileTree from "./(_components)/FileTree";
import Tabs from "./(_components)/Tabs";
import Editor from "./(_components)/Editor";
import { useState } from "react";

export default function Home() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-screen flex flex-col bg-black text-white">
      <FileUploadHander setFile={setZipFile} file={zipFile} />
      <div className="flex flex-1 flex-row">
        <FileTree zipFile={zipFile} />
        <div className="flex flex-col w-full">
          <Tabs />
          <Editor />
        </div>
      </div>
    </div>
  );
}
