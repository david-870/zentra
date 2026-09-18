import { loginAction } from "@/app/ops/actions";
import { Logo } from "@/components/brand/Logo";
import { opsPasswordReady } from "@/lib/ops/config";
import { safeEnsureSeed } from "@/lib/ops/seed";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await safeEnsureSeed();
  const query = await searchParams;
  const ready = opsPasswordReady();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <Logo className="text-4xl" />
      <p className="mt-4 text-[0.7rem] tracking-[0.16em] text-muted uppercase">Ops</p>
      <p className="mt-3 text-muted">Internal enquiry inbox.</p>
      {ready ? (
        <form action={loginAction} className="mt-10 grid gap-4">
          <label className="text-xs tracking-[0.08em] uppercase">
            Email
            <input name="email" type="email" required className="mt-2 w-full border border-line bg-raised px-3 py-3" />
          </label>
          <label className="text-xs tracking-[0.08em] uppercase">
            Password
            <input name="password" type="password" required className="mt-2 w-full border border-line bg-raised px-3 py-3" />
          </label>
          {query.error ? <p className="text-sm text-muted">Wrong email or password.</p> : null}
          <button type="submit" className="mt-2 min-h-12 bg-white text-sm tracking-[0.08em] text-black uppercase">
            Enter
          </button>
        </form>
      ) : (
        <p className="mt-10 text-sm text-muted">
          Add OPS_EMAIL and OPS_PASSWORD in Vercel environment variables, then redeploy.
        </p>
      )}
    </main>
  );
}
