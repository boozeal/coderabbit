import { test, expect } from "@playwright/test";
import path from "path";

test.describe("ZIP 파일 작업 워크플로우", () => {
  test("ZIP 파일 업로드, 수정 및 다운로드", async ({ page }) => {
    // 메인 페이지 로드
    await page.goto("/");
    await expect(page).toHaveTitle(/Online IDE/);

    // 업로드 기능 확인
    const fileInputSelector = 'input[type="file"]';
    await expect(page.locator(fileInputSelector)).toBeVisible({
      visible: false,
    });

    // ZIP 파일 경로 설정 (테스트 ZIP 파일 필요)
    const testZipPath = path.join(__dirname, "../fixtures/test-archive.zip");

    // 파일 업로드 (JavaScript로 input 이벤트 트리거)
    await page.setInputFiles(fileInputSelector, testZipPath);

    // 파일이 성공적으로 로드되었는지 확인
    await expect(page.locator("text=test-archive.zip")).toBeVisible({
      timeout: 10000,
    });

    // 파일 트리에서 파일이 표시되는지 확인
    const fileTreeItem = page.locator("text=file1.txt").first();
    await expect(fileTreeItem).toBeVisible({ timeout: 5000 });

    // 파일 클릭하여 열기
    await fileTreeItem.click();

    // 에디터가 로드되었는지 확인
    const editorSelector = ".monaco-editor";
    await expect(page.locator(editorSelector)).toBeVisible({ timeout: 5000 });

    // 편집기에 텍스트 입력
    // Monaco 에디터는 복잡한 구조를 가지므로 JavaScript 실행을 통해 접근
    await page.evaluate(() => {
      const editor = (window as any).monaco.editor.getModels()[0];
      if (editor) {
        editor.setValue("테스트 내용이 수정되었습니다.");
      }
    });

    // 수정 상태 확인 (파일이 수정되면 다운로드 버튼이 활성화됨)
    await expect(
      page.locator('button:has-text("다운로드")').first()
    ).toBeEnabled({ timeout: 5000 });

    // 다운로드 버튼 클릭
    const downloadPromise = page.waitForEvent("download");
    await page.locator('button:has-text("다운로드")').first().click();

    // 다운로드 완료 대기
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain(".zip");

    // 파일 지우기 테스트
    await page.locator('button:has-text("지우기")').first().click();

    // 파일이 지워졌는지 확인
    await expect(
      page.locator("text=클릭하거나 드래그해서 ZIP 파일을 업로드하세요")
    ).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=file1.txt")).not.toBeVisible();
  });
});
