"use client";

import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { OpenedFile } from "../utils/openedFile";

export default function Editor({
  file,
  setIsModified,
}: {
  file: OpenedFile | null;
  setIsModified: (isModified: boolean) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [prevFileType, setPrevFileType] = useState<string | null>(null);

  useEffect(() => {
    if (!editorRef.current || !file) return;

    const fileTypeChanged = prevFileType && prevFileType !== file.type;
    setPrevFileType(file.type);

    const uri = monaco.Uri.parse(`file:///${file.path}`);

    if (file.type === "text" && file.content) {
      const text = new TextDecoder().decode(file.content);

      // 모델 준비
      let model = monaco.editor.getModel(uri);
      if (!model) {
        model = monaco.editor.createModel(text, undefined, uri);
      }

      // 파일 타입이 바뀌었으면 인스턴스 재생성
      if (!editorInstance || fileTypeChanged) {
        editorInstance?.dispose(); // 기존 인스턴스 제거
        const instance = monaco.editor.create(editorRef.current, {
          model,
          theme: "vs-dark",
          automaticLayout: true,
        });
        setEditorInstance(instance);

        // undo/redo 단축키 설정
        instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
          instance.trigger("keyboard", "undo", null);
        });
        instance.addCommand(
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ,
          () => {
            instance.trigger("keyboard", "redo", null);
          }
        );
      } else {
        editorInstance.setModel(model);
      }

      // 변경 감지
      const disposable = editorInstance?.onDidChangeModelContent(() => {
        setIsModified(true);
      });
      return () => {
        disposable?.dispose();
      };
    }

    // 텍스트가 아닌 파일을 선택하면 에디터 비활성화
    if (fileTypeChanged && editorInstance) {
      editorInstance.dispose();
      setEditorInstance(null);
    }
  }, [file]);

  useEffect(() => {
    if (editorInstance) {
      const disposable = editorInstance.onDidChangeModelContent(() => {
        setIsModified(true);
      });

      return () => {
        disposable?.dispose();
      };
    }
  }, [editorInstance]);

  if (!file) {
    return <div className="flex-1 p-4">No file selected</div>;
  }

  return (
    <div className="flex-1 relative">
      {/* 에디터는 항상 렌더링됨 */}
      <div ref={editorRef} className="absolute inset-0 z-0" />

      {/* 이미지 파일인 경우 오버레이로 이미지 표시 */}
      {file.type === "image" && file.content && (
        <img
          src={URL.createObjectURL(new Blob([file.content]))}
          alt={file.name}
          className="absolute inset-0 object-contain max-h-full max-w-full mx-auto z-10 bg-black"
        />
      )}

      {/* 바이너리 파일인 경우 오버레이로 정보 표시 */}
      {file.type === "binary" && (
        <div className="absolute inset-0 p-4 bg-black text-white z-10 overflow-auto">
          <p>Binary file (not editable)</p>
          <p>Path: {file.path}</p>
          <p>Type: {file.type}</p>
        </div>
      )}
    </div>
  );
}
