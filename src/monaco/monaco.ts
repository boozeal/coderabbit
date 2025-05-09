import * as monaco from "monaco-editor";

// 오버라이드: 워커를 직접 연결
self.MonacoEnvironment = {
  getWorker: function (_: unknown, label: string) {
    switch (label) {
      case "json":
        return new (require("worker-loader!monaco-editor/esm/vs/language/json/json.worker.js"))();
      case "css":
      case "scss":
      case "less":
        return new (require("worker-loader!monaco-editor/esm/vs/language/css/css.worker.js"))();
      case "html":
      case "handlebars":
      case "razor":
        return new (require("worker-loader!monaco-editor/esm/vs/language/html/html.worker.js"))();
      case "typescript":
      case "javascript":
        return new (require("worker-loader!monaco-editor/esm/vs/language/typescript/ts.worker.js"))();
      default:
        return new (require("worker-loader!monaco-editor/esm/vs/editor/editor.worker.js"))();
    }
  },
};
