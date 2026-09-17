import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/ops/auth";
import { db } from "@/lib/ops/db";
import { ensureSeed } from "@/lib/ops/seed";
import { logoutAction, markNotificationsRead } from "@/app/ops/actions";

const nav = [
  { href: "/ops", label: "Overview" },
  { href: "/ops/leads", label: "Pipeline" },
  { href: "/ops/analytics", label: "Analytics" },
  { href: "/ops/knowledge", label: "Knowledge" },
];

export default async function OpsAppLayout({ children }: { children: React.ReactNode }) {
  await ensureSeed();
  const user = await requireUser();
  if (!user) redirect("/ops/login");

  const unread = await db.notification.count({ where: { read: false } });

  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8">
          <p className="font-display text-xl">Zentra Ops</p>
          <nav className="hidden gap-6 text-[0.75rem] tracking-[0.12em] text-muted uppercase sm:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-text">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <form action={markNotificationsRead}>
              <button type="submit" className="text-muted">
                {unread} alerts
              </button>
            </form>
            <form action={logoutAction}>
              <button type="submit" className="text-xs tracking-[0.08em] text-muted uppercase">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="flex gap-4 overflow-x-auto border-t border-line px-5 py-3 text-[0.7rem] tracking-[0.12em] text-muted uppercase sm:hidden">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">{children}</div>
    </div>
  );
}
