export type FileType = "text" | "image" | "binary";

export interface OpenedFile {
  name: string;
  path: string;
  content: Uint8Array | null;
  type: FileType;
}

export interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: TreeNode[];
}
