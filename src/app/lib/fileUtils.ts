export const IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".bmp",
  ".webp",
  ".ico",
];

export const TEXT_EXTENSIONS = [
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".html",
  ".css",
  ".scss",
  ".less",
  ".md",
  ".txt",
  ".xml",
  ".yml",
  ".yaml",
  ".sh",
  ".bat",
  ".c",
  ".cpp",
  ".h",
  ".java",
  ".py",
  ".go",
  ".rb",
  ".php",
  ".swift",
  ".kt",
  ".rs",
  ".sql",
];

export function getExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex === -1 ? "" : filename.slice(lastDotIndex).toLowerCase();
}

export function isImageFile(fileName: string, mimeType?: string): boolean {
  const ext = getExtension(fileName);
  return (
    (mimeType && mimeType.startsWith("image/")) ||
    IMAGE_EXTENSIONS.includes(ext)
  );
}

export function isTextFile(
  fileName: string,
  mimeType?: string,
  buffer?: ArrayBuffer
): boolean {
  const ext = getExtension(fileName);
  const hasNullByte = buffer ? new Uint8Array(buffer).includes(0) : false;
  return (
    ((mimeType && mimeType.startsWith("text/")) ||
      TEXT_EXTENSIONS.includes(ext)) &&
    !hasNullByte
  );
}

export async function classifyFile(
  file: File
): Promise<"text" | "image" | "binary"> {
  if (isImageFile(file.name, file.type)) {
    return "image";
  }

  // 텍스트 파일 여부 확인 (파일의 첫 부분만 읽어서 확인)
  const buffer = await file.slice(0, 1024).arrayBuffer();
  if (isTextFile(file.name, file.type, buffer)) {
    return "text";
  }

  return "binary";
}
