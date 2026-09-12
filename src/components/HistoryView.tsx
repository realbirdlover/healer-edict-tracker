import { useState } from "react";
import { isDone } from "../domain/logic";
import type { Account } from "../domain/types";

export function HistoryView({ acct }: { acct: Account }) {
  const [open, setOpen] = useState<string | null>(null);

  if (acct.history.length === 0) {
    return (
      <p className="mt-4 font-serif text-sm italic text-muted">
        No wipes logged yet. The first one you complete lands here with a frozen copy of the list.
      </p>
    );
  }

  const gap = (i: number) => {
    const next = acct.history[i + 1];
    if (!next) return null;
    const d = Math.round(
      (new Date(acct.history[i].date).getTime() - new Date(next.date).getTime()) / 86400000,
    );
    return d >= 1 ? `${d} ${d === 1 ? "day" : "days"} after the last one` : "same day as the last one";
  };

  return (
    <div className="mt-4 border-l-2 border-rule pl-3.5">
      {acct.history.map((h, i) => {
        const items = [...h.snapshot.gaia, ...h.snapshot.khei];
        const missed = items.filter((it) => !isDone(it));
        const isOpen = open === h.id;
        return (
          <div
            className="relative cursor-pointer border-b border-[#252D36] py-2.5"
            key={h.id}
            onClick={() => setOpen(isOpen ? null : h.id)}
          >
            <span className="absolute -left-[19px] top-[17px] h-2 w-2 rounded-full bg-amber" />
            <div className="flex items-baseline justify-between gap-2.5">
              <span className="font-serif text-base">
                Wipe {h.wipeNumber} · tier {h.tierAfter}
              </span>
              <span className="text-[12.5px] tabular-nums text-muted">
                {new Date(h.date).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-0.5 text-xs tabular-nums text-muted">
              {items.length - missed.length} of {items.length} done
              {gap(i) ? ` · ${gap(i)}` : ""}
            </div>
            {h.note && <div className="mt-1 text-xs text-muted">{h.note}</div>}

            {isOpen && (
              <div className="mt-2 text-[13px] text-dim">
                {missed.length === 0 ? (
                  <p className="m-0">Everything on the list was done.</p>
                ) : (
                  <>
                    <p className="m-0">Not finished on this run:</p>
                    <ul className="mt-1 list-disc pl-[17px]">
                      {missed.map((it) => (
                        <li className="my-0.5 text-rust" key={it.id}>
                          {it.label}
                          {it.kind === "count" && ` (${it.current} of ${it.threshold || it.target})`}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <p className="mb-0 mt-2">
                  Counters:{" "}
                  {items
                    .filter((it) => it.kind === "count")
                    .map((it) => `${it.label} ${it.current}`)
                    .join(", ") || "none"}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
