"use client";

import { useState } from "react";

export default function FileUploadHander() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-[70px]">
      <input type="file" onChange={handleFileChange} />
      {file && <p>{file.name}</p>}
    </div>
  );
}
