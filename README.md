# Elice 미니 프로젝트 - 온라인 ZIP 에디터

ZIP 파일을 업로드하고 내용을 수정한 후 다시 다운로드할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- ZIP 파일 업로드 및 탐색
- 텍스트 파일 편집
- 이미지 및 바이너리 파일 지원
- 수정된 ZIP 파일 다운로드

## 기술 스택

- Next.js 15.3.2
- React 19.0.0
- TypeScript
- Monaco Editor
- Tailwind CSS
- JSZip
- Zustand

## 테스트 방법

본 프로젝트는 단위 테스트와 E2E 테스트를 모두 지원합니다.

### 단위 테스트 (Jest)

단위 테스트는 Jest와 React Testing Library를 사용하여 구현되었습니다.

```bash
# 모든 단위 테스트 실행
npm test

# 특정 파일 테스트
npm test -- fileUtils

# 감시 모드로 테스트 실행
npm run test:watch
```

### E2E 테스트 (Playwright)

E2E 테스트는 Playwright를 사용하여 구현되었습니다.

```bash
# E2E 테스트 실행
npm run test:e2e

# 브라우저 UI로 테스트 실행
npx playwright test --ui
```

## 테스트 구성

### 단위 테스트

- `__tests__/unit/fileUtils.test.ts`: 파일 유틸리티 함수 테스트
- `__tests__/unit/zipHandler.test.ts`: ZIP 파일 처리 함수 테스트
- `__tests__/unit/FileTree.test.tsx`: 파일 트리 컴포넌트 테스트

### E2E 테스트

- `__tests__/e2e/zipWorkflow.spec.ts`: ZIP 파일 업로드 및 다운로드 워크플로우 테스트

### 테스트 데이터

- `__tests__/fixtures/createTestZip.js`: 테스트용 ZIP 파일 생성 스크립트
- `__tests__/fixtures/test-archive.zip`: E2E 테스트용 샘플 ZIP 파일

## 테스트 실행 전 준비

E2E 테스트를 실행하기 전에 테스트용 ZIP 파일을 생성해야 합니다:

```bash
# 테스트용 ZIP 파일 생성
node __tests__/fixtures/createTestZip.js
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
