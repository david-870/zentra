import { notFound } from "next/navigation";
import { sendChatHumanMessage, setChatControlAction } from "@/app/ops/actions";
import { getChatLead } from "@/lib/ops/chat-store";

function formatWhen(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function ChatLeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ send?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const lead = await getChatLead(id);
  if (!lead) notFound();

  const human = lead.control === "HUMAN";

  return (
    <div className="max-w-2xl">
      <p className="text-[0.7rem] tracking-[0.16em] text-muted uppercase">WhatsApp lead</p>
      <h1 className="font-display mt-3 text-4xl">{lead.name || "Unknown"}</h1>
      <p className="mt-2 text-sm text-muted">
        {lead.businessName || "—"} · {lead.phone} · {lead.status.replaceAll("_", " ")}
      </p>
      <p
        className={`mt-4 inline-block px-2 py-1 text-[0.65rem] tracking-[0.14em] uppercase ${
          human ? "border border-text" : "bg-white text-black"
        }`}
      >
        {human ? "You are replying" : "Assistant is replying"}
      </p>
      {lead.problem ? <p className="mt-6 text-sm">{lead.problem}</p> : null}
      <p className="mt-2 text-xs text-muted">
        {lead.packageInterest || lead.serviceInterest || "No package yet"}
        {lead.budgetRange ? ` · ${lead.budgetRange}` : ""}
      </p>

      <form action={setChatControlAction} className="mt-6">
        <input type="hidden" name="id" value={lead.id} />
        <input type="hidden" name="control" value={human ? "AI" : "HUMAN"} />
        <button type="submit" className="min-h-10 border border-line px-4 text-xs tracking-[0.08em] uppercase">
          {human ? "Give back to assistant" : "Take over this chat"}
        </button>
      </form>

      {query.send === "error" ? (
        <p className="mt-6 text-sm text-muted">
          WhatsApp rejected the send. Check the access token in Vercel, then try again.
        </p>
      ) : null}

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

      <form action={sendChatHumanMessage} className="mt-8 grid gap-3 border border-line p-4">
        <input type="hidden" name="id" value={lead.id} />
        <label className="text-xs tracking-[0.08em] uppercase">
          Reply as Zentra
          <textarea
            name="text"
            rows={3}
            required
            className="mt-2 w-full border border-line bg-raised px-3 py-2 text-sm"
            placeholder="Type the next message. Sending this pauses the assistant."
          />
        </label>
        <button type="submit" className="min-h-12 bg-white px-5 text-xs tracking-[0.08em] text-black uppercase">
          Send on WhatsApp
        </button>
      </form>
    </div>
  );
}
