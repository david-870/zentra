import Link from "next/link";
import { LeadStatus } from "@prisma/client";
import { db } from "@/lib/ops/db";
import { scoreLabel } from "@/lib/ops/qualify";

const columns: LeadStatus[] = [
  "NEW",
  "QUALIFYING",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
  "FOLLOW_UP",
  "HUMAN_HANDOFF",
];

export default async function PipelinePage() {
  let leads: Array<{
    id: string;
    name: string | null;
    businessName: string | null;
    phone: string;
    packageInterest: string | null;
    serviceInterest: string | null;
    score: number;
    status: LeadStatus;
    conversation: { messages: { text: string }[] } | null;
  }> = [];
  try {
    leads = await db.lead.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        conversation: { include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } } },
      },
    });
  } catch (error) {
    console.error(error);
    return (
      <div>
        <h1 className="font-display text-4xl">Pipeline</h1>
        <p className="mt-2 text-sm text-muted">
          WhatsApp pipeline needs a durable database. Website enquiries are in the inbox.
        </p>
        <Link href="/ops/enquiries" className="mt-6 inline-flex min-h-12 items-center bg-white px-5 text-xs tracking-[0.08em] text-black uppercase">
          Open enquiries
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Pipeline</h1>
      <p className="mt-2 text-sm text-muted">Move cards on the lead page. Scores are internal only.</p>
      <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
        {columns.map((status) => {
          const items = leads.filter((lead) => lead.status === status);
          return (
            <section key={status} className="w-64 shrink-0">
              <h2 className="text-[0.65rem] tracking-[0.16em] text-muted uppercase">
                {status.replaceAll("_", " ")} · {items.length}
              </h2>
              <ul className="mt-3 space-y-3">
                {items.map((lead) => (
                  <li key={lead.id} className="border border-line bg-raised p-3">
                    <Link href={`/ops/leads/${lead.id}`}>
                      <p className="text-sm">{lead.name ?? "Unknown"}</p>
                      <p className="mt-1 text-xs text-muted">{lead.businessName ?? "—"}</p>
                      <p className="mt-2 text-xs text-muted">{lead.phone}</p>
                      <p className="mt-2 text-xs">
                        {lead.packageInterest ?? lead.serviceInterest ?? "—"} · {scoreLabel(lead.score)}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs text-muted">
                        {lead.conversation?.messages[0]?.text ?? "No message"}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
