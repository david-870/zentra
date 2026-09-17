import Link from "next/link";
import { db } from "@/lib/ops/db";
import { runFollowUpsAction, simulateInbound } from "@/app/ops/actions";

export default async function OpsHome() {
  const [total, fresh, qualified, handoff, won, due] = await Promise.all([
    db.lead.count(),
    db.lead.count({ where: { status: "NEW" } }),
    db.lead.count({ where: { status: "QUALIFIED" } }),
    db.lead.count({ where: { status: "HUMAN_HANDOFF" } }),
    db.lead.count({ where: { status: "WON" } }),
    db.followUp.count({ where: { cancelled: false, sentAt: null, scheduledAt: { lte: new Date() } } }),
  ]);

  const recent = await db.lead.findMany({
    orderBy: { updatedAt: "desc" },
    take: 8,
    include: { conversation: { include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } } } },
  });

  const alerts = await db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 6 });

  const cards = [
    { label: "Total leads", value: total },
    { label: "New", value: fresh },
    { label: "Qualified", value: qualified },
    { label: "Needs human", value: handoff },
    { label: "Follow-ups due", value: due },
    { label: "Won", value: won },
  ];

  return (
    <div className="grid gap-10">
      <div>
        <h1 className="font-display text-4xl">Overview</h1>
        <p className="mt-2 text-sm text-muted">
          Your phone messages are reaching Zentra. If a reply did not send, Meta is blocking outbound to numbers not on the test allow list.
        </p>
      </div>

      <section>
        <h2 className="text-sm tracking-[0.12em] uppercase">Leads</h2>
        <ul className="mt-4 divide-y divide-line border border-line">
          {recent.map((lead) => (
            <li key={lead.id} className="p-4">
              <p className="text-lg">
                {lead.name ?? "Unknown"} · {lead.businessName ?? "No business"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {lead.phone} · {lead.status.replaceAll("_", " ")}
              </p>
              <p className="mt-2 text-sm text-muted">{lead.conversation?.messages[0]?.text ?? "No messages yet"}</p>
              <Link
                href={`/ops/leads/${lead.id}`}
                className="mt-4 inline-flex min-h-12 items-center bg-white px-5 text-xs tracking-[0.08em] text-black uppercase"
              >
                Open conversation
              </Link>
            </li>
          ))}
          {recent.length === 0 ? <li className="p-4 text-sm text-muted">No leads yet.</li> : null}
        </ul>
      </section>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((item) => (
          <div key={item.label} className="border border-line bg-raised p-4">
            <p className="text-[0.65rem] tracking-[0.14em] text-muted uppercase">{item.label}</p>
            <p className="mt-3 text-3xl tabular-nums tracking-normal">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-8">
          <div>
            <h2 className="mb-4 text-sm tracking-[0.12em] uppercase">Alerts</h2>
            <ul className="divide-y divide-line border border-line">
              {alerts.map((item) => (
                <li key={item.id} className="p-4">
                  {item.leadId ? (
                    <Link href={`/ops/leads/${item.leadId}`} className="block hover:text-muted">
                      <p>{item.title}</p>
                      <p className="mt-1 text-sm text-muted">{item.body}</p>
                    </Link>
                  ) : (
                    <>
                      <p>{item.title}</p>
                      <p className="mt-1 text-sm text-muted">{item.body}</p>
                    </>
                  )}
                </li>
              ))}
              {alerts.length === 0 ? <li className="p-4 text-sm text-muted">No alerts.</li> : null}
            </ul>
          </div>

          <form action={runFollowUpsAction} className="border border-line p-4">
            <p className="text-sm">Send due follow-ups now.</p>
            <button type="submit" className="mt-4 min-h-10 bg-white px-4 text-xs tracking-[0.08em] text-black uppercase">
              Run follow-ups
            </button>
            <p className="mt-2 text-xs text-muted">{handoff} conversations waiting on a human.</p>
          </form>

          <form action={simulateInbound} className="grid gap-3 border border-line p-4">
            <p className="text-sm">Test inbound WhatsApp (no Cloud API required).</p>
            <input name="phone" placeholder="2348012345678" className="border border-line bg-raised px-3 py-2 text-sm" />
            <input name="name" placeholder="Name" className="border border-line bg-raised px-3 py-2 text-sm" />
            <textarea name="text" rows={3} placeholder="Message" className="border border-line bg-raised px-3 py-2 text-sm" />
            <button type="submit" className="min-h-10 border border-line text-xs tracking-[0.08em] uppercase">
              Simulate message
            </button>
          </form>
      </section>
    </div>
  );
}
