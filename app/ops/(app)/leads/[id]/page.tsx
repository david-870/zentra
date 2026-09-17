import { notFound } from "next/navigation";
import { LeadStatus } from "@prisma/client";
import { db } from "@/lib/ops/db";
import { scoreLabel } from "@/lib/ops/qualify";
import {
  addNote,
  sendHumanMessage,
  setConversationControl,
  scheduleFollowUp,
} from "@/app/ops/actions";
import { StatusSelect } from "./StatusSelect";

const statuses: LeadStatus[] = [
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

export default async function LeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ send?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" }, include: { user: true } },
      followUps: { orderBy: { scheduledAt: "asc" } },
      conversation: {
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });
  if (!lead) notFound();

  const control = lead.conversation?.control ?? "AI";

  return (
    <div className="grid gap-8 xl:grid-cols-12">
      <section className="xl:order-2 xl:col-span-8">
        <h2 className="text-sm tracking-[0.12em] uppercase">Conversation</h2>
        {query.send === "error" ? (
          <p className="mt-3 text-sm text-muted">
            WhatsApp rejected the send. The access token in `.env` is expired or invalid. Generate a new token in Meta, paste it into
            `WHATSAPP_ACCESS_TOKEN`, restart `npm run dev`, then try again.
          </p>
        ) : null}
        <div className="mt-4 min-h-[28rem] space-y-3 border border-line p-4">
          {lead.conversation?.messages.map((message) => (
            <div key={message.id} className={message.author === "CUSTOMER" ? "max-w-[80%]" : "ml-auto max-w-[80%] text-right"}>
              <p className="text-[0.65rem] tracking-[0.12em] text-muted uppercase">{message.author}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{message.text}</p>
            </div>
          ))}
          {!lead.conversation?.messages.length ? <p className="text-sm text-muted">No messages yet.</p> : null}
        </div>
        {lead.conversation ? (
          <form action={sendHumanMessage.bind(null, lead.conversation.id)} className="mt-4 flex gap-2">
            <input name="text" className="min-h-12 flex-1 border border-line bg-raised px-3" placeholder="Reply as Zentra" />
            <button type="submit" className="bg-white px-5 text-xs tracking-[0.08em] text-black uppercase">
              Send
            </button>
          </form>
        ) : null}
      </section>

      <aside className="grid gap-6 xl:order-1 xl:col-span-4">
        <div>
          <p
            className={`inline-block px-2 py-1 text-[0.65rem] tracking-[0.14em] uppercase ${
              control === "AI" ? "bg-white text-black" : "border border-text"
            }`}
          >
            {control === "AI" ? "AI active" : "Human active"}
          </p>
          <h1 className="font-display mt-4 text-4xl">{lead.name ?? "Unknown"}</h1>
          <p className="mt-2 text-muted">{lead.businessName ?? "No business name"}</p>
        </div>

        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4 border-b border-line py-2">
            <dt className="text-muted">Phone</dt>
            <dd>{lead.phone}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line py-2">
            <dt className="text-muted">Service</dt>
            <dd>{lead.serviceInterest ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line py-2">
            <dt className="text-muted">Package</dt>
            <dd>{lead.packageInterest ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line py-2">
            <dt className="text-muted">Budget</dt>
            <dd>{lead.budgetRange ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line py-2">
            <dt className="text-muted">Source</dt>
            <dd>{lead.source}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line py-2">
            <dt className="text-muted">Score</dt>
            <dd>
              {lead.score} · {scoreLabel(lead.score)}
            </dd>
          </div>
        </dl>

        <p className="text-sm text-muted">{lead.problem ?? "No problem captured yet."}</p>

        <StatusSelect leadId={lead.id} value={lead.status} statuses={statuses} />

        {lead.conversation ? (
          <div className="flex gap-2">
            <form action={setConversationControl.bind(null, lead.conversation.id, "HUMAN")}>
              <button type="submit" className="min-h-10 border border-line px-3 text-xs uppercase">
                Take control
              </button>
            </form>
            <form action={setConversationControl.bind(null, lead.conversation.id, "AI")}>
              <button type="submit" className="min-h-10 border border-line px-3 text-xs uppercase">
                Return to AI
              </button>
            </form>
          </div>
        ) : null}

        <form action={addNote.bind(null, lead.id)} className="grid gap-2">
          <textarea name="text" rows={3} placeholder="Internal note" className="border border-line bg-raised px-3 py-2 text-sm" />
          <button type="submit" className="min-h-10 border border-line text-xs uppercase">
            Add note
          </button>
        </form>

        <ul className="space-y-3 text-sm">
          {lead.notes.map((note) => (
            <li key={note.id} className="border-t border-line pt-3 text-muted">
              {note.text}
              <span className="mt-1 block text-xs">{note.user?.name ?? "Team"}</span>
            </li>
          ))}
        </ul>

        <form action={scheduleFollowUp.bind(null, lead.id)} className="grid gap-2">
          <input name="days" type="number" defaultValue={3} className="border border-line bg-raised px-3 py-2 text-sm" />
          <textarea name="template" rows={3} placeholder="Follow-up message" className="border border-line bg-raised px-3 py-2 text-sm" />
          <button type="submit" className="min-h-10 border border-line text-xs uppercase">
            Schedule follow-up
          </button>
        </form>
      </aside>
    </div>
  );
}
