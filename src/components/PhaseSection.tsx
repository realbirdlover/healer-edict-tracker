import { useMemo } from "react";
import { groupProgress, phaseProgress } from "../domain/logic";
import type { ChecklistItem } from "../domain/types";
import { ItemRow } from "./ItemRow";

export function PhaseSection({
  name,
  items,
  onItem,
}: {
  name: string;
  items: ChecklistItem[];
  onItem: (next: ChecklistItem) => void;
}) {
  const p = phaseProgress(items);
  const groups = useMemo(() => groupProgress(items), [items]);

  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-2">
        <h2 className="font-serif text-lg font-semibold">{name}</h2>
        <span className="text-[13px] tabular-nums text-dim">
          {p.done} / {p.total}
        </span>
      </div>
      {groups.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {groups.map(([g, v]) => (
            <span
              key={g}
              className={
                "rounded-[3px] border px-1.5 py-0.5 text-xs tabular-nums " +
                (v.done >= v.total ? "border-[#3D5A4C] text-verd" : "border-rule text-dim")
              }
            >
              {g} {v.done}/{v.total}
            </span>
          ))}
        </div>
      )}
      {items.length === 0 ? (
        <p className="mt-4 font-serif text-sm italic text-muted">Nothing on this list.</p>
      ) : (
        items.map((it) => <ItemRow key={it.id} item={it} onChange={onItem} />)
      )}
    </section>
  );
}
