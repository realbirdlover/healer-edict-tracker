import { reorderTemplateItems, uid } from "../domain/logic";
import type { Phase, Template, TemplateItem } from "../domain/types";

function emptyItem(): TemplateItem {
  return { tid: uid(), label: "New item", kind: "check", target: 1, threshold: 1, group: "", note: "" };
}

export function TemplateEditor({
  template,
  onChange,
}: {
  template: Template;
  onChange: (next: Template) => void;
}) {
  const patchPhase = (phase: Phase, items: TemplateItem[]) => {
    onChange({ ...template, [phase]: items });
  };

  const patchItem = (phase: Phase, index: number, patch: Partial<TemplateItem>) => {
    const items = template[phase].slice();
    items[index] = { ...items[index], ...patch };
    patchPhase(phase, items);
  };

  const removeItem = (phase: Phase, index: number) => {
    const items = template[phase].slice();
    items.splice(index, 1);
    patchPhase(phase, items);
  };

  const addItem = (phase: Phase) => {
    patchPhase(phase, [...template[phase], emptyItem()]);
  };

  const move = (phase: Phase, index: number, dir: -1 | 1) => {
    patchPhase(phase, reorderTemplateItems(template[phase], index, dir));
  };

  const renderPhase = (phase: Phase, label: string) => (
    <div className="mt-4">
      <h3 className="font-serif text-base font-semibold">{label}</h3>
      <div className="mt-2 flex flex-col gap-2">
        {template[phase].map((item, i) => (
          <div key={item.tid} className="rounded border border-rule bg-panel p-3">
            <div className="flex flex-wrap gap-2">
              <input
                className="min-w-40 flex-1 rounded-sm border border-rule bg-ink px-2 py-1 text-sm text-bone"
                value={item.label}
                onChange={(e) => patchItem(phase, i, { label: e.target.value })}
                aria-label="Item label"
              />
              <select
                className="rounded-sm border border-rule bg-ink px-2 py-1 text-sm text-bone"
                value={item.kind}
                onChange={(e) =>
                  patchItem(phase, i, { kind: e.target.value as "check" | "count" })
                }
              >
                <option value="check">Checkbox</option>
                <option value="count">Counter</option>
              </select>
            </div>

            {item.kind === "count" && (
              <div className="mt-2 flex flex-wrap gap-2">
                <label className="flex items-center gap-1 text-xs text-muted">
                  Target
                  <input
                    className="w-20 rounded-sm border border-rule bg-ink px-2 py-1 text-sm text-bone"
                    type="number"
                    min={0}
                    value={item.target}
                    onChange={(e) => patchItem(phase, i, { target: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  />
                </label>
                <label className="flex items-center gap-1 text-xs text-muted">
                  Real threshold
                  <input
                    className="w-20 rounded-sm border border-rule bg-ink px-2 py-1 text-sm text-bone"
                    type="number"
                    min={0}
                    value={item.threshold}
                    onChange={(e) => patchItem(phase, i, { threshold: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  />
                </label>
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              <input
                className="min-w-32 flex-1 rounded-sm border border-rule bg-ink px-2 py-1 text-sm text-bone"
                placeholder="Group (optional)"
                value={item.group}
                onChange={(e) => patchItem(phase, i, { group: e.target.value })}
              />
            </div>
            <textarea
              className="mt-2 w-full rounded-sm border border-rule bg-ink px-2 py-1 text-sm text-bone"
              placeholder="Note (optional)"
              rows={2}
              value={item.note}
              onChange={(e) => patchItem(phase, i, { note: e.target.value })}
            />

            <div className="mt-2 flex gap-1.5">
              <button
                className="rounded-sm border border-rule bg-ink px-2 py-1 text-xs text-bone hover:bg-raise disabled:opacity-30"
                onClick={() => move(phase, i, -1)}
                disabled={i === 0}
              >
                Move up
              </button>
              <button
                className="rounded-sm border border-rule bg-ink px-2 py-1 text-xs text-bone hover:bg-raise disabled:opacity-30"
                onClick={() => move(phase, i, 1)}
                disabled={i === template[phase].length - 1}
              >
                Move down
              </button>
              <button
                className="rounded-sm border border-[#4A3129] bg-ink px-2 py-1 text-xs text-rust hover:bg-raise"
                onClick={() => removeItem(phase, i)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        className="mt-2 rounded-sm border border-rule bg-panel px-2 py-1 text-xs text-bone hover:bg-raise"
        onClick={() => addItem(phase)}
      >
        Add item to {label}
      </button>
    </div>
  );

  return (
    <div>
      <p className="text-[12.5px] text-muted">
        Changes here take effect on the next reset or completed wipe — they never rewrite a life
        already in progress or a wipe already archived in history.
      </p>
      {renderPhase("gaia", "Gaia")}
      {renderPhase("khei", "Khei")}
    </div>
  );
}
