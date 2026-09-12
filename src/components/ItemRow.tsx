import { isDone, setCurrent, stepCurrent, toggleDone } from "../domain/logic";
import type { ChecklistItem } from "../domain/types";

export function ItemRow({
  item,
  onChange,
}: {
  item: ChecklistItem;
  onChange: (next: ChecklistItem) => void;
}) {
  const done = isDone(item);
  const thr = item.threshold || item.target || 1;
  const scale = Math.max(item.target || thr, thr);
  const pct = Math.min(100, Math.round((item.current / scale) * 100));

  return (
    <div className="flex items-start gap-3 border-b border-[#252D36] py-2.5">
      {item.kind === "check" ? (
        <button
          className={
            "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm border p-0 " +
            (done ? "border-verd bg-verd" : "border-[#4A5663] hover:border-verd")
          }
          onClick={() => onChange(toggleDone(item))}
          aria-pressed={done}
          aria-label={item.label}
        >
          {done && (
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-none stroke-ink stroke-[2.2]">
              <path d="M2 6.2 5 9l5-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      ) : (
        <span
          className={
            "mt-0.5 h-[18px] w-[18px] shrink-0 rounded-sm border " +
            (done ? "border-verd bg-verd" : "border-[#4A5663]")
          }
          aria-hidden="true"
        />
      )}

      <div className="min-w-0 flex-1">
        {item.kind === "check" ? (
          <div
            className={"cursor-pointer font-serif text-base " + (done ? "text-muted" : "text-bone")}
            onClick={() => onChange(toggleDone(item))}
          >
            {item.label}
          </div>
        ) : (
          <div className={"font-serif text-base " + (done ? "text-muted" : "text-bone")}>
            {item.label}
          </div>
        )}

        {item.kind === "count" && (
          <>
            <div className="mt-0.5 text-xs tabular-nums text-muted">
              {item.current} of {item.target} tracked
              {thr !== item.target && (
                <>
                  {" "}
                  · <em className="not-italic text-amber">{thr} needed</em>
                </>
              )}
            </div>
            <div className="mt-2 h-[3px] max-w-[260px] overflow-hidden rounded-sm bg-[#2B343E]">
              <div
                className={"bar-fill h-full " + (done ? "bg-verd" : "bg-amber")}
                style={{ width: pct + "%" }}
              />
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <button
                className="h-[30px] w-[30px] rounded-sm border border-rule bg-panel text-lg leading-none text-bone hover:bg-raise"
                onClick={() => onChange(stepCurrent(item, -1))}
                aria-label={"One fewer " + item.label}
              >
                −
              </button>
              <input
                className="h-[30px] w-[62px] rounded-sm border border-rule bg-panel text-center text-sm tabular-nums text-bone"
                type="number"
                value={item.current}
                min={0}
                onChange={(e) => onChange(setCurrent(item, parseInt(e.target.value, 10) || 0))}
                aria-label={item.label + " count"}
              />
              <button
                className="h-[30px] w-[30px] rounded-sm border border-rule bg-panel text-lg leading-none text-bone hover:bg-raise"
                onClick={() => onChange(stepCurrent(item, 1))}
                aria-label={"One more " + item.label}
              >
                +
              </button>
            </div>
          </>
        )}

        {item.note && <div className="mt-1 max-w-[62ch] text-xs text-muted">{item.note}</div>}
      </div>
    </div>
  );
}
