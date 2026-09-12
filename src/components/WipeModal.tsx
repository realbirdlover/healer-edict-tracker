import { useState } from "react";
import { tierOf } from "../domain/logic";

export function WipeModal({
  allDone,
  gaia,
  khei,
  wipes,
  tiers,
  onCancel,
  onConfirm,
}: {
  allDone: boolean;
  gaia: { done: number; total: number };
  khei: { done: number; total: number };
  wipes: number;
  tiers: number[];
  onCancel: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  const n = wipes + 1;
  const before = tierOf(wipes, tiers);
  const after = tierOf(n, tiers);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,13,17,0.78)] p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[460px] rounded-md border border-rule bg-panel p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="m-0 mb-2 font-serif text-xl font-semibold">Complete wipe {n}</h3>
        <p className="m-0 text-sm text-dim">
          The current list gets frozen into history and a fresh one starts.
          {after > before && ` This one reaches tier ${after}.`}
        </p>
        {!allDone && (
          <p className="my-2.5 text-[13.5px] text-amber">
            Unfinished: Gaia {gaia.done}/{gaia.total}, Khei {khei.done}/{khei.total}. Logging it
            anyway is fine, the edict just may not progress.
          </p>
        )}
        <div className="mt-3">
          <label className="mb-1 block text-xs text-muted" htmlFor="wipenote">
            Note for the history entry
          </label>
          <input
            id="wipenote"
            className="w-full rounded-sm border border-rule bg-ink px-2.5 py-1.5 text-sm text-bone"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What you'd want to remember about this run"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="rounded-sm border border-amber bg-amber px-3.5 py-2 text-sm font-semibold text-ink hover:bg-[#D8A055]"
            onClick={() => onConfirm(note)}
          >
            Log wipe {n}
          </button>
          <button
            className="rounded-sm border border-rule bg-panel px-3.5 py-2 text-sm text-bone hover:bg-raise"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
