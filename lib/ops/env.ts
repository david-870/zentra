export function readEnv(key: string) {
  const value = process.env[key];
  if (typeof value !== "string") return "";
  return value.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
}
