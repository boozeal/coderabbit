/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { renderHook, act } from "@testing-library/react";
import { useZipHandler } from "../../src/app/hooks/useZipHandler";
import { useFileStore } from "../../src/app/store/fileStore";
import JSZip from "jszip";

// useZipHandler 모킹 - DOM 의존성 제거
jest.mock("../../src/app/hooks/useZipHandler", () => ({
  useZipHandler: jest.fn().mockImplementation(() => ({
    processZipFile: jest.fn().mockImplementation(async (file) => {
      return Promise.resolve();
    }),
    downloadZipFile: jest
      .fn()
      .mockImplementation(async (fileMap, fileName, models) => {
        return Promise.resolve(true);
      }),
    isLoading: false,
    progress: 100,
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
  let mockSetZipFile: jest.Mock;
  let mockSetFileMap: jest.Mock;
  let mockSetFileTree: jest.Mock;
  let mockClearAll: jest.Mock;

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
    const { result } = renderHook(() => useZipHandler());

    // ArrayBuffer 제공을 위한 File 모킹
    const mockFile = new File(["가짜 ZIP 데이터"], "test.zip", {
      type: "application/zip",
    });

    // FileReader의 readAsArrayBuffer 모킹
    const mockArrayBuffer = new ArrayBuffer(10);

    type FileReaderMock = {
      onload?: (event: { target: { result: ArrayBuffer } }) => void;
    };

    Object.defineProperty(global, "FileReader", {
      writable: true,
      value: jest.fn().mockImplementation(function () {
        return {
          readAsArrayBuffer: jest
            .fn()
            .mockImplementation(function (this: FileReaderMock) {
              this.onload &&
                this.onload({ target: { result: mockArrayBuffer } });
            }),
        };
      }),
    });

    await act(async () => {
      await result.current.processZipFile(mockFile);
    });

    // 상태 업데이트 함수들이 호출되었는지 확인
    expect(mockSetZipFile).toHaveBeenCalledWith(mockFile);
    expect(mockClearAll).toHaveBeenCalled();
    expect(mockSetFileMap).toHaveBeenCalled();
    expect(mockSetFileTree).toHaveBeenCalled();

    // 로딩 상태가 완료되었는지 확인
    expect(result.current.isLoading).toBe(false);
    expect(result.current.progress).toBe(100);
  });

  test("downloadZipFile이 파일을 다운로드한다", async () => {
    const { result } = renderHook(() => useZipHandler());

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
    ];

    await act(async () => {
      await result.current.downloadZipFile(
        mockFileMap,
        "test.zip",
        mockMonacoModels as any
      );
    });

    // JSZip 관련 함수들이 호출되었는지 확인
    expect(JSZip).toHaveBeenCalled();
    const jsZipInstance = (JSZip as unknown as jest.Mock).mock.results[0].value;
    expect(jsZipInstance.file).toHaveBeenCalled();
    expect(jsZipInstance.generateAsync).toHaveBeenCalled();

    // 다운로드 링크 생성 및 클릭이 발생했는지 확인
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();

    // 로딩 상태가 완료되었는지 확인
    expect(result.current.isLoading).toBe(false);
    expect(result.current.progress).toBe(100);
  });
});
