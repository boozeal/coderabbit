"use client";

export default function Tabs({
  openFiles,
  onClose,
  onSelect,
  selectedFile,
}: {
  openFiles: string[];
  onClose: (file: string) => void;
  onSelect: (file: string) => void;
  selectedFile: string | null;
}) {
  return (
    <div className="w-full h-[40px] border-2 border-gray-400 flex overflow-x-auto">
      {openFiles.map((file, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 p-2 min-w-[100px] max-w-[200px] border-1 border-gray-400 ${
            file === selectedFile ? "bg-[#1E1E1E] text-[#EBCB8B]" : ""
          }`}
          onClick={() => onSelect(file)}
        >
          <span className="truncate">{file.split("/").pop()}</span>
          <button onClick={() => onClose(file)}>X</button>
        </div>
      ))}
    </div>
  );
}
