import nodeProcess from "node:process";

function clean(value?: string) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
}

export function runtimeEnv(name: string) {
  return clean(nodeProcess.env[name]);
}
