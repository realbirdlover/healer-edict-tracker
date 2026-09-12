import { useState } from "react";
import { phaseProgress, tierOf } from "../domain/logic";
import { useStore } from "../store";

export function AccountsScreen({
  onOpen,
  onSettings,
}: {
  onOpen: (id: string) => void;
  onSettings: () => void;
}) {
  const accounts = useStore((s) => s.accounts);
  const tiers = useStore((s) => s.tiers);
  const addAccount = useStore((s) => s.addAccount);
  const renameAccount = useStore((s) => s.renameAccount);
  const setAccountWipes = useStore((s) => s.setAccountWipes);
  const deleteAccount = useStore((s) => s.deleteAccount);
  const [name, setName] = useState("");

  const add = () => {
    const n = name.trim();
    if (!n) return;
    void addAccount(n);
    setName("");
  };

  return (
    <>
      {accounts.map((a) => {
        const g = phaseProgress(a.checklist.gaia);
        const k = phaseProgress(a.checklist.khei);
        const max = Math.min(tiers[tiers.length - 1] || 1, 15);
        return (
          <div key={a.id}>
            <button
              className="mt-3 block w-full rounded border border-rule border-l-[3px] border-l-amber bg-panel p-3.5 px-4 text-left text-bone hover:bg-raise"
              onClick={() => onOpen(a.id)}
            >
              <div className="font-serif text-xl font-semibold">{a.name}</div>
              <div className="mt-0.5 text-[13px] tabular-nums text-dim">
                {a.totalWipes} {a.totalWipes === 1 ? "wipe" : "wipes"} · tier{" "}
                {tierOf(a.totalWipes, tiers)} of {tiers.length} · this life {g.done + k.done} /{" "}
                {g.total + k.total}
              </div>
              <div className="mt-2 flex gap-0.5" aria-hidden="true">
                {Array.from({ length: max }, (_, i) => (
                  <span
                    key={i}
                    className={"h-4 w-[3px] rounded-[1px] " + (i < a.totalWipes ? "bg-amber" : "bg-[#2B343E]")}
                  />
                ))}
              </div>
            </button>
            <div className="mt-1.5 flex flex-wrap gap-2 pl-0.5">
              <button
                className="rounded-sm border border-rule bg-panel px-2 py-1 text-xs text-bone hover:bg-raise"
                onClick={() => {
                  const v = prompt("Account name", a.name);
                  if (v && v.trim()) void renameAccount(a.id, v.trim());
                }}
              >
                Rename
              </button>
              <button
                className="rounded-sm border border-rule bg-panel px-2 py-1 text-xs text-bone hover:bg-raise"
                onClick={() => {
                  const v = prompt("Total wipes on this account", String(a.totalWipes));
                  if (v === null) return;
                  void setAccountWipes(a.id, parseInt(v, 10) || 0);
                }}
              >
                Set wipe count
              </button>
              {accounts.length > 1 && (
                <button
                  className="rounded-sm border border-[#4A3129] bg-panel px-2 py-1 text-xs text-rust hover:bg-raise"
                  onClick={() => {
                    if (confirm(`Delete ${a.name} and its history?`)) void deleteAccount(a.id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div className="mt-5 flex flex-wrap gap-2">
        <input
          className="h-[38px] flex-1 basis-40 rounded-sm border border-rule bg-panel px-2.5 text-sm text-bone"
          value={name}
          placeholder="New account name"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          aria-label="New account name"
        />
        <button
          className="rounded-sm border border-rule bg-panel px-3.5 py-2 text-sm text-bone hover:bg-raise"
          onClick={add}
        >
          Add account
        </button>
      </div>

      <div className="mt-4">
        <button
          className="rounded-sm border border-rule bg-panel px-2 py-1 text-xs text-bone hover:bg-raise"
          onClick={onSettings}
        >
          Tier thresholds, template, and backup
        </button>
      </div>
    </>
  );
}
