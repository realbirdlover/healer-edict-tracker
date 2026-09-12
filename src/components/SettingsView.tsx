import { useRef, useState } from "react";
import { useStore } from "../store";
import type { ExportShape } from "../store";
import { TemplateEditor } from "./TemplateEditor";

export function SettingsView() {
  const tiers = useStore((s) => s.tiers);
  const template = useStore((s) => s.template);
  const setTiers = useStore((s) => s.setTiers);
  const updateTemplate = useStore((s) => s.updateTemplate);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [msg, setMsg] = useState("");

  const exportJson = () => {
    try {
      const data = exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "healer-edict-tracker.json";
      a.click();
      URL.revokeObjectURL(url);
      setMsg("Exported.");
    } catch {
      setMsg("Download didn't work here.");
    }
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const v = JSON.parse(String(reader.result)) as ExportShape;
        if (!v.accounts || !v.template) throw new Error("shape");
        void importData(v);
        setMsg("Imported. Everything was replaced with the file's contents.");
      } catch {
        setMsg("That file isn't a tracker export. Nothing changed.");
      }
    };
    reader.readAsText(f);
    e.target.value = "";
  };

  return (
    <>
      <section className="mt-6">
        <div className="border-b border-rule pb-2">
          <h2 className="font-serif text-lg font-semibold">Tier thresholds</h2>
        </div>
        <p className="mt-2 text-[12.5px] text-muted">
          Wipes needed for each tier. Change them here if the game rebalances again.
        </p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {tiers.map((t, i) => (
            <div key={i} className="min-w-[110px] flex-1">
              <label className="mb-1 block text-xs text-muted">Tier {i + 1}</label>
              <input
                className="w-full rounded-sm border border-rule bg-ink px-2 py-1.5 text-sm text-bone"
                type="number"
                min={1}
                value={t}
                onChange={(e) => {
                  const v = Math.max(1, parseInt(e.target.value, 10) || 1);
                  void setTiers(tiers.map((x, j) => (j === i ? v : x)));
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="rounded-sm border border-rule bg-panel px-2 py-1 text-xs text-bone hover:bg-raise"
            onClick={() => void setTiers([...tiers, (tiers[tiers.length - 1] || 0) + 5])}
          >
            Add a tier
          </button>
          {tiers.length > 1 && (
            <button
              className="rounded-sm border border-[#4A3129] bg-panel px-2 py-1 text-xs text-rust hover:bg-raise"
              onClick={() => void setTiers(tiers.slice(0, -1))}
            >
              Remove last tier
            </button>
          )}
        </div>
      </section>

      <section className="mt-6">
        <div className="border-b border-rule pb-2">
          <h2 className="font-serif text-lg font-semibold">Checklist template</h2>
        </div>
        <TemplateEditor template={template} onChange={(t) => void updateTemplate(t)} />
      </section>

      <section className="mt-6">
        <div className="border-b border-rule pb-2">
          <h2 className="font-serif text-lg font-semibold">Backup</h2>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="rounded-sm border border-rule bg-panel px-3.5 py-2 text-sm text-bone hover:bg-raise"
            onClick={exportJson}
          >
            Download JSON
          </button>
          <button
            className="rounded-sm border border-rule bg-panel px-3.5 py-2 text-sm text-bone hover:bg-raise"
            onClick={() => fileRef.current?.click()}
          >
            Import JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImportFile} />
        </div>
        {msg && <p className="mt-2 text-[12.5px] text-muted">{msg}</p>}
      </section>
    </>
  );
}
