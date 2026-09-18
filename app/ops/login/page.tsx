import { Logo } from "@/components/brand/Logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <Logo className="text-4xl" />
      <p className="mt-4 text-[0.7rem] tracking-[0.16em] text-muted uppercase">Ops</p>
      <p className="mt-3 text-muted">Internal enquiry inbox.</p>
      <p className="mt-2 text-sm text-muted">Sign in with david@zentra.local</p>
      <form action="/api/ops/login" method="post" className="mt-10 grid gap-4">
        <label className="text-xs tracking-[0.08em] uppercase">
          Email
          <input
            name="email"
            type="email"
            required
            defaultValue="david@zentra.local"
            className="mt-2 w-full border border-line bg-raised px-3 py-3"
          />
        </label>
        <label className="text-xs tracking-[0.08em] uppercase">
          Password
          <input name="password" type="password" required className="mt-2 w-full border border-line bg-raised px-3 py-3" />
        </label>
        {query.error === "1" ? <p className="text-sm text-muted">Wrong email or password.</p> : null}
        {query.error === "env" ? (
          <p className="text-sm text-muted">The server cannot read OPS_PASSWORD yet. Check that variable in Vercel, then redeploy.</p>
        ) : null}
        {query.error === "session" ? (
          <p className="text-sm text-muted">Password was accepted, but the inbox session could not be saved.</p>
        ) : null}
        <button type="submit" className="mt-2 min-h-12 bg-white text-sm tracking-[0.08em] text-black uppercase">
          Enter
        </button>
      </form>
    </main>
  );
}
