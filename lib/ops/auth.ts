import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/ops/db";
import { opsConfig } from "@/lib/ops/config";

const COOKIE = "zentra_ops";
export const ENV_OPS_USER_ID = "ops-env";

export type OpsUser = {
  id: string;
  email: string;
  name: string;
};

function cleanSession() {
  const value = process.env.SESSION_SECRET;
  if (typeof value !== "string") return "";
  return value.trim().replace(/^(['"])(.*)\1$/, "$2").trim();
}

function secret() {
  const value = cleanSession();
  if (value.length >= 16) return value;
  const fallback = opsConfig.ops.password;
  if (fallback.length >= 8) {
    return createHmac("sha256", "zentra-ops-session").update(fallback).digest("hex");
  }
  throw new Error("SESSION_SECRET is missing or too short.");
}

export function envOpsUser(): OpsUser | null {
  if (!opsConfig.ops.password) return null;
  return {
    id: ENV_OPS_USER_ID,
    email: opsConfig.ops.email.toLowerCase(),
    name: "David",
  };
}

export function sameText(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const current = Buffer.from(hash, "hex");
  if (next.length !== current.length) return false;
  return timingSafeEqual(next, current);
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export async function createSession(userId: string) {
  const payload = `${userId}.${Date.now()}`;
  const token = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSessionUser(): Promise<OpsUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, issued, signature] = parts;
  if (sign(`${userId}.${issued}`) !== signature) return null;
  if (userId === ENV_OPS_USER_ID) return envOpsUser();
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (user) return { id: user.id, email: user.email, name: user.name };
  } catch (error) {
    console.error(error);
  }
  return null;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) return null;
  return user;
}
