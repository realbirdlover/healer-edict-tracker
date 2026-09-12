import { nextTier, tierOf } from "../domain/logic";

export function Tally({ wipes, tiers }: { wipes: number; tiers: number[] }) {
  const max = Math.max(tiers[tiers.length - 1] || 1, wipes);
  const shown = Math.min(max, 20);
  const groups: number[][] = [];
  for (let i = 0; i < shown; i += 5) {
    groups.push(Array.from({ length: Math.min(5, shown - i) }, (_, j) => i + j + 1));
  }
  const tier = tierOf(wipes, tiers);
  const nxt = nextTier(wipes, tiers);

  return (
    <div className="mt-4 flex flex-wrap items-end gap-3.5">
      <div className="flex gap-2.5" aria-hidden="true">
        {groups.map((g, gi) => (
          <div className="flex gap-1" key={gi}>
            {g.map((n) => (
              <span
                key={n}
                className={
                  "w-1 h-[30px] rounded-[1px] " +
                  (n <= wipes
                    ? "bg-amber"
                    : nxt && n <= nxt
                      ? "border border-dashed border-[#46525F]"
                      : "bg-[#2B343E]")
                }
              />
            ))}
          </div>
        ))}
      </div>
      <div className="pb-0.5 text-[13px] text-dim">
        <b className="font-semibold text-bone">{wipes}</b> {wipes === 1 ? "wipe" : "wipes"} · tier{" "}
        <b className="font-semibold text-bone">{tier}</b> of {tiers.length}
        {nxt ? ` · ${nxt - wipes} more to tier ${tier + 1}` : " · maxed"}
      </div>
    </div>
  );
}
