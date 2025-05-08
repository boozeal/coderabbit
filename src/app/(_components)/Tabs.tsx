"use client";

export default function Tabs({
  openFiles,
  onClose,
}: {
  openFiles: string[];
  onClose: (file: string) => void;
}) {
  return (
    <div className="w-full h-[70px] border-2 border-gray-400">
      {openFiles.map((file, index) => (
        <div key={index} className="flex items-center gap-2">
          <button onClick={() => onClose(file)}>X</button>
          <span>{file}</span>
        </div>
      ))}
    </div>
  );
}
