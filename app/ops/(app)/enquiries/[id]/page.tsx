import { notFound } from "next/navigation";
import { getWebsiteEnquiry } from "@/lib/ops/enquiry-postgres";

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

  const rows = [
    { label: "Business", value: enquiry.business },
    { label: "Phone / WhatsApp", value: enquiry.phone || "—" },
    { label: "Email", value: enquiry.email || "—" },
    { label: "Website", value: enquiry.website || "Not provided" },
    { label: "Received", value: formatWhen(enquiry.createdAt) },
    {
      label: "WhatsApp ping",
      value: enquiry.notifiedAt
        ? `Sent ${formatWhen(enquiry.notifiedAt)}`
        : enquiry.notifyError || "Not sent",
    },
  ];

  return (
    <div className="max-w-2xl">
      <p className="text-[0.7rem] tracking-[0.16em] text-muted uppercase">Website enquiry</p>
      <h1 className="font-display mt-3 text-4xl">{enquiry.name}</h1>

      <dl className="mt-8 grid gap-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 border-b border-line py-2">
            <dt className="text-muted">{row.label}</dt>
            <dd className="text-right">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 whitespace-pre-wrap text-sm">{enquiry.need}</p>

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex min-h-12 items-center bg-white px-5 text-xs tracking-[0.08em] text-black uppercase"
        >
          WhatsApp this lead
        </a>
      ) : null}
    </div>
  );
}
