import Link from "next/link";
import { db } from "@/lib/ops/db";
import { runFollowUpsAction, simulateInbound } from "@/app/ops/actions";
import { listChatLeads } from "@/lib/ops/chat-store";
import { listWebsiteEnquiries, postgresConfigured } from "@/lib/ops/enquiry-postgres";
import { whatsappConfigured } from "@/lib/ops/whatsapp";

function formatWhen(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function OpsHome() {
  const enquiries = await listWebsiteEnquiries(8);
  const chatLeads = await listChatLeads();
  const whatsapp = whatsappConfigured();

  let total = 0;
  let fresh = 0;
  let handoff = 0;
  let won = 0;
  let due = 0;
  let alerts: Awaited<ReturnType<typeof db.notification.findMany>> = [];
  let prismaReady = false;

  try {
    [total, fresh, handoff, won, due] = await Promise.all([
      db.lead.count(),
      db.lead.count({ where: { status: "NEW" } }),
      db.lead.count({ where: { status: "HUMAN_HANDOFF" } }),
      db.lead.count({ where: { status: "WON" } }),
      db.followUp.count({ where: { cancelled: false, sentAt: null, scheduledAt: { lte: new Date() } } }),
    ]);
    alerts = await db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 6 });
    prismaReady = true;
  } catch (error) {
    console.error(error);
  }

  const cards = [
    { label: "Website enquiries", value: enquiries.length },
    { label: "Total leads", value: total },
    { label: "New", value: fresh },
    { label: "Needs human", value: handoff },
    { label: "Follow-ups due", value: due },
    { label: "Won", value: won },
  ];

  return (
    <div className="grid gap-10">
      <div>
        <h1 className="font-display text-4xl">Overview</h1>
        <p className="mt-2 text-sm text-muted">
          {postgresConfigured() ? "Website enquiries are being saved." : "Website enquiry storage is not connected."}{" "}
          {whatsapp ? "A WhatsApp ping is sent when a form arrives." : "WhatsApp ping is off until Cloud API keys are set in Vercel."}
        </p>
      </div>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-sm tracking-[0.12em] uppercase">Latest enquiries</h2>
          <Link href="/ops/enquiries" className="text-xs tracking-[0.08em] text-muted uppercase hover:text-text">
            Open inbox
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line border border-line">
          {enquiries.map((item) => (
            <li key={item.id} className="p-4">
              <p className="text-lg">
                {item.name} · {item.business}
              </p>
              <p className="mt-1 text-sm text-muted">
                {item.phone || "No phone"} · {item.email || "No email"} · {formatWhen(item.createdAt)}
              </p>
              <p className="mt-2 text-sm text-muted">{item.need}</p>
              <Link
                href={`/ops/enquiries/${item.id}`}
                className="mt-4 inline-flex min-h-12 items-center bg-white px-5 text-xs tracking-[0.08em] text-black uppercase"
              >
                Open enquiry
              </Link>
            </li>
          ))}
          {enquiries.length === 0 ? <li className="p-4 text-sm text-muted">No website enquiries yet.</li> : null}
        </ul>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-sm tracking-[0.12em] uppercase">WhatsApp leads</h2>
          <Link href="/ops/leads" className="text-xs tracking-[0.08em] text-muted uppercase hover:text-text">
            Open pipeline
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line border border-line">
          {chatLeads.slice(0, 8).map((lead) => (
            <li key={lead.id} className="p-4">
              <p className="text-lg">
                {lead.name || "Unknown"} · {lead.businessName || "No business"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {lead.phone} · {lead.status.replaceAll("_", " ")}
              </p>
              <p className="mt-2 text-sm text-muted">{lead.lastMessage || "No messages yet"}</p>
              <Link
                href={`/ops/chats/${lead.id}`}
                className="mt-4 inline-flex min-h-12 items-center bg-white px-5 text-xs tracking-[0.08em] text-black uppercase"
              >
                Open conversation
              </Link>
            </li>
          ))}
          {chatLeads.length === 0 ? <li className="p-4 text-sm text-muted">No WhatsApp leads yet.</li> : null}
        </ul>
      </section>

      {prismaReady ? (
        <>
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
        </>
      ) : null}
    </div>
  );
}
