import fs from "fs";

const originalReadFileSync = fs.readFileSync;

fs.readFileSync = function (...args: Parameters<typeof fs.readFileSync>) {
  const result = originalReadFileSync.apply(this, args);
  if (typeof result === "string") {
    return result.replace(/\r\n/g, "\n");
  }
  return result;
} as typeof fs.readFileSync;
