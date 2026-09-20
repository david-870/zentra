import { notFound } from "next/navigation";
import { getChatLead } from "@/lib/ops/chat-store";

function formatWhen(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function ChatLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getChatLead(id);
  if (!lead) notFound();

  return (
    <div className="max-w-2xl">
      <p className="text-[0.7rem] tracking-[0.16em] text-muted uppercase">WhatsApp lead</p>
      <h1 className="font-display mt-3 text-4xl">{lead.name || "Unknown"}</h1>
      <p className="mt-2 text-sm text-muted">
        {lead.businessName || "—"} · {lead.phone} · {lead.status.replaceAll("_", " ")}
      </p>
      {lead.problem ? <p className="mt-6 text-sm">{lead.problem}</p> : null}
      <p className="mt-2 text-xs text-muted">
        {lead.packageInterest || lead.serviceInterest || "No package yet"}
        {lead.budgetRange ? ` · ${lead.budgetRange}` : ""}
      </p>
      <ol className="mt-10 space-y-4">
        {lead.messages.map((message, index) => (
          <li key={`${message.createdAt.toISOString()}-${index}`} className="border-b border-line pb-3">
            <p className="text-[0.65rem] tracking-[0.14em] text-muted uppercase">
              {message.author} · {formatWhen(message.createdAt)}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{message.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
