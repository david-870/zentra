import { readFileSync } from "node:fs";

function clean(value?: string) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
}

let cached: Record<string, string> | null = null;

function rawProcessEnv() {
  if (cached) return cached;
  try {
    const raw = readFileSync("/proc/self/environ", "utf8");
    cached = Object.fromEntries(
      raw
        .split("\0")
        .filter(Boolean)
        .map((pair) => {
          const index = pair.indexOf("=");
          if (index === -1) return [pair, ""];
          return [pair.slice(0, index), pair.slice(index + 1)];
        }),
    );
  } catch {
    cached = {};
  }
  return cached;
}

export function runtimeEnv(name: string) {
  const fromProc = clean(rawProcessEnv()[name]);
  if (fromProc) return fromProc;

  for (const [key, value] of Object.entries(process.env)) {
    if (key !== name) continue;
    const cleaned = clean(value);
    if (cleaned) return cleaned;
  }

  return clean(process.env[name]);
}
