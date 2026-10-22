import { redirect } from "next/navigation";
import { requireUser } from "@/lib/ops/auth";
export async function requirePageUser() {
  const user = await requireUser();
  if (!user) redirect("/ops/login");
  return user;
}
