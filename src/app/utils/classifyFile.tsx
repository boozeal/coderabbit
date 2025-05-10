const imageExtensions = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".bmp",
  ".webp",
  ".ico",
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
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex === -1 ? "" : filename.slice(lastDotIndex).toLowerCase();
}

function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

function isTextMime(mimeType: string): boolean {
  return mimeType.startsWith("text/");
}

function hasNullByte(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
  return bytes.includes(0); // 0x00
}

// --- File 객체용 ---
export async function isImageFile(file: File): Promise<boolean> {
  const ext = getExtension(file.name);
  return isImageMime(file.type) || imageExtensions.includes(ext);
}

export async function isTextFile(file: File): Promise<boolean> {
  const ext = getExtension(file.name);
  const buffer = await file.slice(0, 1024).arrayBuffer();
  return (
    (isTextMime(file.type) || textExtensions.includes(ext)) &&
    !hasNullByte(buffer)
  );
}

export async function isBinaryFile(file: File): Promise<boolean> {
  const isImage = await isImageFile(file);
  const isText = await isTextFile(file);
  return !isImage && !isText;
}
