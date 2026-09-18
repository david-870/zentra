import { db } from "@/lib/ops/db";

export default async function AnalyticsPage() {
  let leads: Awaited<ReturnType<typeof db.lead.findMany>> = [];
  try {
    leads = await db.lead.findMany();
  } catch (error) {
    console.error(error);
    return (
      <div>
        <h1 className="font-display text-4xl">Analytics</h1>
        <p className="mt-2 text-sm text-muted">Analytics for WhatsApp conversations will show once that database is live.</p>
      </div>
    );
  }
  const total = leads.length;
  const qualified = leads.filter((item) => ["QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON"].includes(item.status)).length;
  const proposal = leads.filter((item) => item.status === "PROPOSAL").length;
  const won = leads.filter((item) => item.status === "WON").length;
  const lost = leads.filter((item) => item.status === "LOST").length;

  function tally(key: "serviceInterest" | "packageInterest" | "source") {
    const map = new Map<string, number>();
    for (const lead of leads) {
      const value = lead[key] ?? "unknown";
      map.set(value, (map.get(value) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }

  const conversations = await db.conversation.findMany({ include: { messages: { orderBy: { createdAt: "asc" } } } });
  const ai = conversations.filter((item) => item.control === "AI").length;
  const human = conversations.filter((item) => item.control === "HUMAN").length;

  let gaps = 0;
  let gapMs = 0;
  for (const conversation of conversations) {
    for (let i = 0; i < conversation.messages.length; i += 1) {
      const inbound = conversation.messages[i];
      if (inbound.direction !== "IN") continue;
      const outbound = conversation.messages.slice(i + 1).find((item) => item.direction === "OUT");
      if (!outbound) continue;
      gaps += 1;
      gapMs += outbound.createdAt.getTime() - inbound.createdAt.getTime();
    }
  }
  const avgSeconds = gaps ? Math.round(gapMs / gaps / 1000) : 0;

  return (
    <div className="grid gap-10">
      <div>
        <h1 className="font-display text-4xl">Analytics</h1>
        <p className="mt-2 text-sm text-muted">Simple conversion view. Internal only.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-5">
        {[
          ["Leads", total],
          ["Qualified", qualified],
          ["Proposal", proposal],
          ["Won", won],
          ["Lost", lost],
        ].map(([label, value]) => (
          <div key={String(label)} className="border border-line bg-raised p-4">
            <p className="text-[0.65rem] tracking-[0.14em] text-muted uppercase">{label}</p>
            <p className="mt-3 text-3xl tabular-nums tracking-normal">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <List title="Services" rows={tally("serviceInterest")} />
        <List title="Packages" rows={tally("packageInterest")} />
        <List title="Sources" rows={tally("source")} />
      </div>
      <p className="text-sm text-muted">
        AI conversations: {ai}. Human conversations: {human}. Average response time: {avgSeconds}s.
      </p>
    </div>
  );
}

function List({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <section>
      <h2 className="text-sm tracking-[0.12em] uppercase">{title}</h2>
      <ul className="mt-4 divide-y divide-line border border-line">
        {rows.map(([name, count]) => (
          <li key={name} className="flex justify-between p-3 text-sm">
            <span>{name}</span>
            <span className="text-muted">{count}</span>
          </li>
        ))}
        {rows.length === 0 ? <li className="p-3 text-sm text-muted">No data.</li> : null}
      </ul>
    </section>
  );
}
