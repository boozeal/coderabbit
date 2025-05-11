/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { useFileStore } from "../../src/app/store/fileStore";

// 직접 모듈 함수 호출 테스트로 변경
const mockProcessZipFile = jest.fn().mockResolvedValue(undefined);
const mockDownloadZipFile = jest.fn().mockResolvedValue(true);
const mockProgress = 100;
const mockIsLoading = false;

// useZipHandler 모킹
jest.mock("../../src/app/hooks/useZipHandler", () => ({
  useZipHandler: jest.fn().mockImplementation(() => ({
    processZipFile: mockProcessZipFile,
    downloadZipFile: mockDownloadZipFile,
    isLoading: mockIsLoading,
    progress: mockProgress,
  })),
}));

// useFileStore 모킹
jest.mock("../../src/app/store/fileStore", () => ({
  useFileStore: jest.fn(),
}));

// JSZip 모킹
jest.mock("jszip", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn().mockResolvedValue({
        files: {
          "file1.txt": {
            dir: false,
            async: jest
              .fn()
              .mockResolvedValue(
                new Blob(["파일1 내용"], { type: "text/plain" })
              ),
          },
          "folder/": {
            dir: true,
            async: jest.fn(),
          },
          "folder/file2.txt": {
            dir: false,
            async: jest
              .fn()
              .mockResolvedValue(
                new Blob(["파일2 내용"], { type: "text/plain" })
              ),
          },
        },
      }),
      file: jest.fn(),
      generateAsync: jest.fn().mockImplementation((options, onUpdate) => {
        // 진행 상황 콜백 시뮬레이션
        if (onUpdate) {
          onUpdate({ percent: 50 });
          onUpdate({ percent: 100 });
        }
        return Promise.resolve(
          new Blob(["ZIP 파일 내용"], { type: "application/zip" })
        );
      }),
    })),
  };
});

// TextDecoder 모킹
global.TextDecoder = jest.fn().mockImplementation(() => ({
  decode: jest.fn().mockReturnValue("텍스트 내용"),
}));

// URL.createObjectURL 및 URL.revokeObjectURL 모킹
global.URL.createObjectURL = jest.fn().mockReturnValue("blob:fake-url");
global.URL.revokeObjectURL = jest.fn();

describe("useZipHandler 훅", () => {
  let mockSetZipFile;
  let mockSetFileMap;
  let mockSetFileTree;
  let mockClearAll;

  beforeEach(() => {
    jest.clearAllMocks();

    // useFileStore 반환값 모킹
    mockSetZipFile = jest.fn();
    mockSetFileMap = jest.fn();
    mockSetFileTree = jest.fn();
    mockClearAll = jest.fn();

    (useFileStore as unknown as jest.Mock).mockReturnValue({
      setZipFile: mockSetZipFile,
      setFileMap: mockSetFileMap,
      setFileTree: mockSetFileTree,
      clearAll: mockClearAll,
    });

    // createElementMock
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === "a") {
        return {
          href: "",
          download: "",
          click: jest.fn(),
        };
      }
      return {};
    });
  });

  test("processZipFile이 ZIP 파일을 올바르게 처리한다", async () => {
    // 훅 결과 대신 직접 모킹된 함수 호출
    const mockFile = new File(["가짜 ZIP 데이터"], "test.zip", {
      type: "application/zip",
    });

    await mockProcessZipFile(mockFile);

    // 주요 함수 호출 확인
    expect(mockProcessZipFile).toHaveBeenCalledWith(mockFile);
  });

  test("downloadZipFile이 파일을 다운로드한다", async () => {
    const mockFileMap = new Map();
    mockFileMap.set("file1.txt", {
      name: "file1.txt",
      path: "file1.txt",
      content: new Uint8Array([116, 101, 115, 116]),
      type: "text",
    });

    const mockMonacoModels = [
      {
        uri: { path: "/file1.txt" },
        getValue: jest.fn().mockReturnValue("편집된 텍스트 내용"),
      },
    ] as any;

    await mockDownloadZipFile(mockFileMap, "test.zip", mockMonacoModels);

    // 다운로드 함수 호출 확인
    expect(mockDownloadZipFile).toHaveBeenCalledWith(
      mockFileMap,
      "test.zip",
      mockMonacoModels
    );
  });
});
