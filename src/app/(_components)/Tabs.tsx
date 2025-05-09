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
    <div className="w-full h-[40px] border-1 border-[#202020] flex overflow-x-auto">
      {openFiles.map((file, index) => (
        <div
          key={index}
          className={`flex items-center justify-between p-2 min-w-[100px] max-w-[200px] ${
            file === selectedFile
              ? "bg-[#1E1E1E] text-[#EBCB8B]"
              : "border-1 border-gray-400"
          }`}
          onClick={() => onSelect(file)}
        >
          <span className="truncate text-sm">📄 {file.split("/").pop()}</span>
          <button onClick={() => onClose(file)} className="px-1">
            X
          </button>
        </div>
      ))}
    </div>
  );
}
