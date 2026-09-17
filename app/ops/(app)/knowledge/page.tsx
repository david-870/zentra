import { db } from "@/lib/ops/db";
import { updateKnowledge } from "@/app/ops/actions";

export default async function KnowledgePage() {
  const items = await db.knowledgeBaseItem.findMany({ orderBy: { title: "asc" } });
  const packs = await db.package.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="grid gap-10">
      <div>
        <h1 className="font-display text-4xl">Knowledge</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          The assistant answers from this, not from invented copy. Update prices and policies here.
        </p>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <form key={item.id} action={updateKnowledge} className="border border-line p-4">
            <input type="hidden" name="id" value={item.id} />
            <p className="text-sm">{item.title}</p>
            <textarea name="body" defaultValue={item.body} rows={5} className="mt-3 w-full border border-line bg-raised px-3 py-2 text-sm" />
            <button type="submit" className="mt-3 min-h-10 border border-line px-4 text-xs uppercase">
              Save
            </button>
          </form>
        ))}
      </div>
      <section>
        <h2 className="text-sm tracking-[0.12em] uppercase">Packages in CRM</h2>
        <ul className="mt-4 divide-y divide-line border border-line">
          {packs.map((item) => (
            <li key={item.id} className="p-4">
              <p>{item.name}</p>
              <p className="mt-1 text-sm text-muted">{item.priceLabel}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
