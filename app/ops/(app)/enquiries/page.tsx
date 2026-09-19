import Link from "next/link";
import { listWebsiteEnquiries, postgresConfigured } from "@/lib/ops/enquiry-postgres";
import { whatsappConfigured } from "@/lib/ops/whatsapp";

function formatWhen(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function EnquiriesPage() {
  const enquiries = await listWebsiteEnquiries();
  const whatsapp = whatsappConfigured();
  const stored = postgresConfigured();

  return (
    <div>
      <h1 className="font-display text-4xl">Enquiries</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Website form submissions. {stored ? "Saved." : "Database is not connected."}{" "}
        {whatsapp ? "WhatsApp ping is on." : "WhatsApp ping is off until Cloud API keys are set in Vercel."}
      </p>

      <ul className="mt-8 divide-y divide-line border border-line">
        {enquiries.map((item) => (
          <li key={item.id}>
            <Link href={`/ops/enquiries/${item.id}`} className="block p-4 hover:bg-raised">
              <p className="text-lg">
                {item.name} · {item.business}
              </p>
              <p className="mt-1 text-sm text-muted">
                {item.phone || "No phone"} · {item.email || "No email"}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{item.need}</p>
              <p className="mt-2 text-xs text-muted">
                {formatWhen(item.createdAt)}
                {item.archivedAt ? " · Archived" : ` · ${item.status.replaceAll("_", " ")}`}
                {item.emailNotifiedAt ? " · Email sent" : item.emailNotifyError ? " · Email failed" : ""}
                {item.notifiedAt ? " · WhatsApp sent" : item.notifyError ? " · WhatsApp failed" : ""}
              </p>
            </Link>
          </li>
        ))}
        {enquiries.length === 0 ? (
          <li className="p-4 text-sm text-muted">No website enquiries yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
