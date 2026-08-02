import fs from "fs";
import path from "path";

type JsonObject = { [key: string]: any };

function getKeys(obj: JsonObject, prefix = ""): string[] {
  let keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getKeys(obj[k], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

export function verifyKeyParity(enPath: string, skPath: string): { success: boolean; errors: string[] } {
  const enObj = JSON.parse(fs.readFileSync(enPath, "utf8"));
  const skObj = JSON.parse(fs.readFileSync(skPath, "utf8"));

  const enKeys = getKeys(enObj);
  const skKeys = getKeys(skObj);

  const missingInSk = enKeys.filter((k) => !skKeys.includes(k));
  const missingInEn = skKeys.filter((k) => !enKeys.includes(k));

  const errors: string[] = [];
  if (missingInSk.length > 0) {
    errors.push(`Keys missing in sk.json: ${missingInSk.join(", ")}`);
  }
  if (missingInEn.length > 0) {
    errors.push(`Keys missing in en.json: ${missingInEn.join(", ")}`);
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

if (require.main === module) {
  const messagesDir = path.resolve(__dirname, "../../messages");
  const enPath = path.join(messagesDir, "en.json");
  const skPath = path.join(messagesDir, "sk.json");

  console.log("Checking i18n key parity between en.json and sk.json...");
  const result = verifyKeyParity(enPath, skPath);

  if (result.success) {
    console.log("SUCCESS: 100% key parity between en.json and sk.json!");
    process.exit(0);
  } else {
    console.error("FAILURE: Key parity mismatch!");
    result.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
}
