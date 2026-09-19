import { notFound } from "next/navigation";
import { archiveWebsiteEnquiryAction, updateWebsiteEnquiryAction } from "@/app/ops/actions";
import { ENQUIRY_STATUSES, getWebsiteEnquiry } from "@/lib/ops/enquiry-postgres";

function formatWhen(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function digits(value: string) {
  return value.replace(/\D/g, "");
}

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enquiry = await getWebsiteEnquiry(id);
  if (!enquiry) notFound();

  const phone = digits(enquiry.phone);
  const whatsappHref = phone ? `https://wa.me/${phone}` : "";
  const followUpValue = enquiry.followUpAt ? enquiry.followUpAt.toISOString().slice(0, 10) : "";

  const rows = [
    { label: "Business", value: enquiry.business },
    { label: "Phone / WhatsApp", value: enquiry.phone || "—" },
    { label: "Email", value: enquiry.email || "—" },
    { label: "Website", value: enquiry.website || "Not provided" },
    { label: "Received", value: formatWhen(enquiry.createdAt) },
    { label: "Status", value: enquiry.status.replaceAll("_", " ") },
    {
      label: "Follow-up",
      value: enquiry.followUpAt ? formatWhen(enquiry.followUpAt) : "Not set",
    },
    {
      label: "Email ping",
      value: enquiry.emailNotifiedAt
        ? `Sent ${formatWhen(enquiry.emailNotifiedAt)}`
        : enquiry.emailNotifyError || "Not sent",
    },
    {
      label: "WhatsApp ping",
      value: enquiry.notifiedAt
        ? `Sent ${formatWhen(enquiry.notifiedAt)}`
        : enquiry.notifyError || "Not sent",
    },
  ];

  return (
    <div className="max-w-2xl">
      <p className="text-[0.7rem] tracking-[0.16em] text-muted uppercase">
        Website enquiry{enquiry.archivedAt ? " · archived" : ""}
      </p>
      <h1 className="font-display mt-3 text-4xl">{enquiry.name}</h1>

      <dl className="mt-8 grid gap-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 border-b border-line py-2">
            <dt className="text-muted">{row.label}</dt>
            <dd className="max-w-[28ch] text-right break-words">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 whitespace-pre-wrap text-sm">{enquiry.need}</p>
      {enquiry.notes ? <p className="mt-4 whitespace-pre-wrap text-sm text-muted">{enquiry.notes}</p> : null}

      <form action={updateWebsiteEnquiryAction} className="mt-10 grid gap-4 border border-line p-4">
        <input type="hidden" name="id" value={enquiry.id} />
        <label className="text-xs tracking-[0.08em] uppercase">
          Status
          <select name="status" defaultValue={enquiry.status} className="mt-2 w-full border border-line bg-raised px-3 py-2">
            {ENQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs tracking-[0.08em] uppercase">
          Follow-up date
          <input
            name="followUpAt"
            type="date"
            defaultValue={followUpValue}
            className="mt-2 w-full border border-line bg-raised px-3 py-2"
          />
        </label>
        <label className="text-xs tracking-[0.08em] uppercase">
          Notes
          <textarea
            name="notes"
            rows={4}
            defaultValue={enquiry.notes}
            className="mt-2 w-full border border-line bg-raised px-3 py-2"
          />
        </label>
        <button type="submit" className="min-h-12 bg-white text-xs tracking-[0.08em] text-black uppercase">
          Save enquiry
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-4">
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center bg-white px-5 text-xs tracking-[0.08em] text-black uppercase"
          >
            WhatsApp this lead
          </a>
        ) : null}
        <form action={archiveWebsiteEnquiryAction}>
          <input type="hidden" name="id" value={enquiry.id} />
          <input type="hidden" name="archived" value={enquiry.archivedAt ? "0" : "1"} />
          <button type="submit" className="min-h-12 border border-line px-5 text-xs tracking-[0.08em] uppercase">
            {enquiry.archivedAt ? "Unarchive" : "Archive"}
          </button>
        </form>
      </div>
    </div>
  );
}
