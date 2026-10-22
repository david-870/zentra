import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { opsConfig } from "@/lib/ops/config";

import { deleteOpsSession, opsSessionValid } from "@/lib/ops/session-store";

const COOKIE = "zentra_ops";
export const ENV_OPS_USER_ID = "ops-env";

export type OpsUser = {
  id: string;
  email: string;
  name: string;
};

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

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    try {
      await deleteOpsSession(token);
    } catch (error) {
      console.error("Ops session operation failed");
    }
  }
  jar.delete(COOKIE);
}

export async function getSessionUser(): Promise<OpsUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) return null;

  try {
    if (await opsSessionValid(token)) {
      return {
        id: ENV_OPS_USER_ID,
        email: opsConfig.ops.email,
        name: "David",
      };
    }
  } catch (error) {
    console.error("Ops session operation failed");
  }

  return null;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) return null;
  return user;
}
