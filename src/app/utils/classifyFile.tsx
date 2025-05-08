const imageExtensions = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".bmp",
  ".webp",
];
const textExtensions = [
  ".js",
  ".ts",
  ".tsx",
  ".json",
  ".html",
  ".css",
  ".scss",
  ".md",
  ".txt",
  ".xml",
  ".yml",
  ".sh",
  ".c",
  ".cpp",
  ".py",
  ".java",
];

function getExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

function isTextMime(mimeType: string): boolean {
  return mimeType.startsWith("text/");
}

function hasNullByte(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
  return bytes.includes(0); // 0x00이 포함되어 있으면 바이너리로 판단
}

export async function classifyFile(
  file: File
): Promise<"image" | "text" | "binary"> {
  const ext = getExtension(file.name);
  const mime = file.type;
  const buffer = await file.slice(0, 1024).arrayBuffer(); // 처음 1KB만 검사

  // 이미지 판단
  if (isImageMime(mime) || imageExtensions.includes(ext)) {
    return "image";
  }

  // 텍스트 판단
  if (
    (isTextMime(mime) || textExtensions.includes(ext)) &&
    !hasNullByte(buffer)
  ) {
    return "text";
  }

  // 나머지는 binary
  return "binary";
}
