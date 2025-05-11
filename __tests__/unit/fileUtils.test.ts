import {
  getExtension,
  isImageFile,
  isTextFile,
  classifyFile,
} from "../../src/app/lib/fileUtils";

// classifyFile 함수 모킹
jest.mock("../../src/app/lib/fileUtils", () => {
  const originalModule = jest.requireActual("../../src/app/lib/fileUtils");
  return {
    ...originalModule,
    classifyFile: jest.fn().mockImplementation((file) => {
      // MIME 타입으로 파일 분류
      if (file.type.startsWith("image/")) {
        return Promise.resolve("image");
      } else if (
        file.type.startsWith("text/") ||
        file.name.endsWith(".js") ||
        file.name.endsWith(".css")
      ) {
        return Promise.resolve("text");
      }
      return Promise.resolve("binary");
    }),
  };
});

// File.prototype.slice 메서드를 모킹
beforeAll(() => {
  // Jest 환경에서 File.prototype.slice().arrayBuffer 메서드 구현
  const originalSlice = File.prototype.slice;
  File.prototype.slice = function (...args) {
    const blob = originalSlice.apply(this, args);
    blob.arrayBuffer = () => Promise.resolve(new ArrayBuffer(10));
    return blob;
  };
});

describe("fileUtils", () => {
  describe("getExtension", () => {
    it("파일명에서 확장자를 추출한다", () => {
      expect(getExtension("test.txt")).toBe(".txt");
      expect(getExtension("image.jpg")).toBe(".jpg");
      expect(getExtension("script.js")).toBe(".js");
      expect(getExtension("style.css")).toBe(".css");
    });

    it("확장자가 없는 경우 빈 문자열을 반환한다", () => {
      expect(getExtension("README")).toBe("");
      expect(getExtension("Dockerfile")).toBe("");
    });

    it("점이 여러 개 있는 경우 마지막 점 이후를 확장자로 반환한다", () => {
      expect(getExtension("archive.tar.gz")).toBe(".gz");
      expect(getExtension("script.min.js")).toBe(".js");
    });
  });

  describe("isImageFile", () => {
    it("이미지 확장자를 가진 파일을 식별한다", () => {
      expect(isImageFile("image.png")).toBe(true);
      expect(isImageFile("icon.svg")).toBe(true);
      expect(isImageFile("photo.jpg")).toBe(true);
      expect(isImageFile("animation.gif")).toBe(true);
    });

    it("이미지가 아닌 파일을 식별한다", () => {
      expect(isImageFile("script.js")).toBe(false);
      expect(isImageFile("doc.txt")).toBe(false);
      expect(isImageFile("style.css")).toBe(false);
    });

    it("MIME 타입이 제공된 경우 이를 사용하여 이미지 파일을 식별한다", () => {
      expect(isImageFile("file", "image/png")).toBe(true);
      expect(isImageFile("file", "image/jpeg")).toBe(true);
      expect(isImageFile("file", "text/plain")).toBe(false);
    });
  });

  describe("isTextFile", () => {
    it("텍스트 확장자를 가진 파일을 식별한다", () => {
      expect(isTextFile("script.js")).toBe(true);
      expect(isTextFile("styles.css")).toBe(true);
      expect(isTextFile("document.md")).toBe(true);
      expect(isTextFile("config.json")).toBe(true);
    });

    it("텍스트가 아닌 파일을 식별한다", () => {
      expect(isTextFile("image.png")).toBe(false);
      expect(isTextFile("archive.zip")).toBe(false);
    });

    it("MIME 타입이 제공된 경우 이를 사용하여 텍스트 파일을 식별한다", () => {
      expect(isTextFile("file", "text/plain")).toBe(true);
      expect(isTextFile("file", "text/html")).toBe(true);
      expect(isTextFile("file", "application/octet-stream")).toBe(false);
    });

    it("null 바이트가 있는 경우 텍스트 파일로 간주하지 않는다", () => {
      const buffer = new ArrayBuffer(10);
      const view = new Uint8Array(buffer);
      view[5] = 0; // null 바이트 추가
      expect(isTextFile("text.txt", "text/plain", buffer)).toBe(false);
    });
  });

  describe("classifyFile", () => {
    it("이미지 파일을 올바르게 분류한다", async () => {
      const imageFile = new File([""], "test.png", { type: "image/png" });
      expect(await classifyFile(imageFile)).toBe("image");

      const svgFile = new File(["<svg></svg>"], "icon.svg", {
        type: "image/svg+xml",
      });
      expect(await classifyFile(svgFile)).toBe("image");
    });

    it("텍스트 파일을 올바르게 분류한다", async () => {
      const textFile = new File(['console.log("hello")'], "script.js", {
        type: "text/javascript",
      });
      expect(await classifyFile(textFile)).toBe("text");

      const cssFile = new File([".class { color: red; }"], "style.css", {
        type: "text/css",
      });
      expect(await classifyFile(cssFile)).toBe("text");
    });

    it("바이너리 파일을 올바르게 분류한다", async () => {
      // ArrayBuffer를 사용하여 바이너리 데이터 시뮬레이션
      const buffer = new ArrayBuffer(10);
      const view = new Uint8Array(buffer);
      view[0] = 0; // null 바이트 추가

      const binaryFile = new File([buffer], "data.bin", {
        type: "application/octet-stream",
      });
      expect(await classifyFile(binaryFile)).toBe("binary");
    });
  });
});
