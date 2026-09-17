"use client";

import { LeadStatus } from "@prisma/client";
import { updateLeadStatus } from "@/app/ops/actions";

export function StatusSelect({
  leadId,
  value,
  statuses,
}: {
  leadId: string;
  value: LeadStatus;
  statuses: LeadStatus[];
}) {
  return (
    <form action={updateLeadStatus.bind(null, leadId)}>
      <label className="text-xs tracking-[0.08em] uppercase">
        Status
        <select
          name="status"
          defaultValue={value}
          className="mt-2 w-full border border-line bg-raised px-3 py-2"
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
