import Link from "next/link";
import { listChatLeads } from "@/lib/ops/chat-store";
import { scoreLabel } from "@/lib/ops/qualify";

const columns = [
  "NEW",
  "QUALIFYING",
  "QUALIFIED",
  "PROPOSAL",
  "HUMAN_HANDOFF",
  "WON",
  "LOST",
];

export default async function PipelinePage() {
  const leads = await listChatLeads();

  return (
    <div>
      <h1 className="font-display text-4xl">Pipeline</h1>
      <p className="mt-2 text-sm text-muted">
        WhatsApp conversations. The assistant qualifies the lead, then a person takes over when needed.
      </p>
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
                    <Link href={`/ops/chats/${lead.id}`}>
                      <p className="text-sm">{lead.name || "Unknown"}</p>
                      <p className="mt-1 text-xs text-muted">{lead.businessName || "—"}</p>
                      <p className="mt-2 text-xs text-muted">{lead.phone}</p>
                      <p className="mt-2 text-xs">
                        {lead.packageInterest || lead.serviceInterest || "—"} · {scoreLabel(lead.score)}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs text-muted">{lead.lastMessage || "No message"}</p>
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
