import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "node_modules" && file !== ".next") {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

describe("Translation scope guards", () => {
  it("ensures public v1 API routes and test files do not contain localized Slovak error messages", () => {
    const webRoot = path.resolve(__dirname, "../../..");
    const apiV1Dir = path.join(webRoot, "app", "api", "v1");
    const allWebFiles = getAllFiles(webRoot);

    const slovakDiacriticsRegex = new RegExp("[ľ" + "ščťžýáéíóúôä]", "i");
    const testFileRegex = /(\.test\.ts|\.test\.tsx|[\\/]\_\_tests\_\_[\\/])/;

    const violations: string[] = [];

    allWebFiles.forEach((file) => {
      if (file.endsWith("translation-scope-guard.test.ts")) return;
      const isTestFile = testFileRegex.test(file);
      const isApiV1 = file.startsWith(apiV1Dir);

      if (isTestFile || isApiV1) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");
        lines.forEach((line, index) => {
          // Allow UTF-8 test byte length checks (e.g. csvByteLength("é"))
          if (line.includes("csvByteLength") || line.includes("practiceBackupJsonByteLength") || line.includes("repeat(100)")) {
            return;
          }
          if (slovakDiacriticsRegex.test(line)) {
            violations.push(`${path.relative(webRoot, file)}:${index + 1}: ${line.trim()}`);
          }
        });
      }
    });

    expect(violations).toEqual([]);
  });
});
