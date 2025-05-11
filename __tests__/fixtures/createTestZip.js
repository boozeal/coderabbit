/**
 * 테스트용 ZIP 파일을 생성하는 스크립트
 */
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

async function createTestZipFile() {
  const zip = new JSZip();

  // 텍스트 파일 추가
  zip.file("file1.txt", "이것은 테스트 파일 1입니다.");

  // 폴더 생성 및 파일 추가
  const folder = zip.folder("folder");
  folder.file("file2.txt", "이것은 폴더 안의 테스트 파일 2입니다.");
  folder.file("file3.js", "console.log('Hello, World!');");

  // JSON 파일 추가
  zip.file(
    "config.json",
    JSON.stringify(
      {
        name: "테스트 설정",
        version: "1.0.0",
      },
      null,
      2
    )
  );

  // 중첩 폴더 생성
  const nestedFolder = zip.folder("folder/nested");
  nestedFolder.file("file4.md", "# 중첩 폴더의 마크다운 파일");

  // ZIP 파일 생성
  const content = await zip.generateAsync({ type: "nodebuffer" });

  // 결과 ZIP 파일 저장
  const outputPath = path.join(__dirname, "test-archive.zip");
  fs.writeFileSync(outputPath, content);

  console.log(`테스트 ZIP 파일이 생성되었습니다: ${outputPath}`);
}

createTestZipFile().catch((err) => {
  console.error("ZIP 파일 생성 중 오류 발생:", err);
  process.exit(1);
});
