import { isImageFile, isTextFile } from "./classifyFile";

export type OpenedFile = {
  name: string;
  path: string;
  content: Uint8Array | null;
  type: "image" | "text" | "binary";
};

export async function createOpenedFile(
  file: File,
  path: string
): Promise<OpenedFile> {
  if (await isImageFile(file)) {
    const buffer = await file.arrayBuffer();
    return {
      name: file.name,
      path,
      content: new Uint8Array(buffer),
      type: "image",
    };
  }

  if (await isTextFile(file)) {
    const buffer = await file.arrayBuffer();
    return {
      name: file.name,
      path,
      content: new Uint8Array(buffer),
      type: "text",
    };
  }

  return {
    name: file.name,
    path,
    content: null,
    type: "binary",
  };
}
