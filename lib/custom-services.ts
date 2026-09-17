import { isCustomServiceId } from "@/content/services";

const KEY = "zentra.customServices";

export function saveCustomServices(ids: string[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(ids));
}

export function parseServiceIds(value: string | string[] | null | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  if (!raw) return [];
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(isCustomServiceId);
}

export function readCustomServices(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string" && isCustomServiceId(id))
      : [];
  } catch {
    return [];
  }
}

export function customHref(ids: string[]) {
  const params = new URLSearchParams({ package: "custom" });
  for (const id of ids) params.append("services", id);
  return `/?${params.toString()}#contact`;
}
