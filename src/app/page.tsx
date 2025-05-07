import Image from "next/image";
import FileUploadHander from "./(_components)/FileUploadHander";
import FileTree from "./(_components)/FileTree";
import Tabs from "./(_components)/Tabs";
import Editor from "./(_components)/Editor";

export default function Home() {
  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-screen flex flex-col">
      <FileUploadHander />
      <div className="flex flex-row">
        <FileTree />
        <div className="flex flex-col w-full">
          <Tabs />
          <Editor />
        </div>
      </div>
    </div>
  );
}
