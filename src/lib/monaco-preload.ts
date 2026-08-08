import { loader, type Monaco } from "@monaco-editor/react";

let monacoInit: Promise<Monaco> | undefined;

export function preloadMonaco(): Promise<Monaco> {
  if (!monacoInit) {
    loader.config({
      paths: {
        vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.56.0/min/vs",
      },
    });
    monacoInit = Promise.resolve(loader.init()).catch((error: unknown) => {
      monacoInit = undefined;
      throw error;
    });
  }

  return monacoInit;
}
