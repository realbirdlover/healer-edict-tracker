import { useState } from "react";
import { phaseProgress } from "../domain/logic";
import { useStore } from "../store";
import type { Account } from "../domain/types";
import { HistoryView } from "./HistoryView";
import { PhaseSection } from "./PhaseSection";
import { Tally } from "./Tally";
import { WipeModal } from "./WipeModal";

export function AccountView({ account, onBack }: { account: Account; onBack: () => void }) {
  const tiers = useStore((s) => s.tiers);
  const updateItem = useStore((s) => s.updateItem);
  const resetLife = useStore((s) => s.resetLife);
  const completeWipe = useStore((s) => s.completeWipe);
  const [tab, setTab] = useState<"run" | "history">("run");
  const [wipeOpen, setWipeOpen] = useState(false);

  const gaia = phaseProgress(account.checklist.gaia);
  const khei = phaseProgress(account.checklist.khei);
  const allDone = gaia.done === gaia.total && khei.done === khei.total;

  return (
    <>
      <header className="pb-3.5 pt-5">
        <button className="border-0 bg-none p-0 text-[13px] text-muted hover:text-bone" onClick={onBack}>
          ← Accounts
        </button>
        <h1 className="mt-0.5 font-serif text-[26px] font-semibold">{account.name}</h1>
        <Tally wipes={account.totalWipes} tiers={tiers} />
      </header>

      <nav className="mt-5 flex gap-0.5 border-b border-rule">
        {(["run", "history"] as const).map((k) => (
          <button
            key={k}
            className={
              "border-b-2 px-3 py-2.5 text-sm " +
              (tab === k ? "border-amber text-bone" : "border-transparent text-muted hover:text-dim")
            }
            onClick={() => setTab(k)}
          >
            {k === "run" ? "This life" : "History"}
          </button>
        ))}
      </nav>

      {tab === "run" && (
        <>
          <PhaseSection
            name="Gaia"
            items={account.checklist.gaia}
            onItem={(next) => void updateItem(account.id, "gaia", next)}
          />
          <PhaseSection
            name="Khei"
            items={account.checklist.khei}
            onItem={(next) => void updateItem(account.id, "khei", next)}
          />
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              className="rounded-sm border border-amber bg-amber px-3.5 py-2 text-sm font-semibold text-ink hover:bg-[#D8A055]"
              onClick={() => setWipeOpen(true)}
            >
              Complete wipe
            </button>
            <button
              className="rounded-sm border border-rule bg-panel px-3.5 py-2 text-sm text-bone hover:bg-raise"
              onClick={() => {
                if (confirm("Clear every check and counter on this life? History is untouched.")) {
                  void resetLife(account.id);
                }
              }}
            >
              Reset this life
            </button>
          </div>
          <p className="mt-3 text-[12.5px] text-muted">
            Completing a wipe freezes this list into history, adds one to the counter, and starts a
            clean list.
          </p>
        </>
      )}

      {tab === "history" && <HistoryView acct={account} />}

      {wipeOpen && (
        <WipeModal
          allDone={allDone}
          gaia={gaia}
          khei={khei}
          wipes={account.totalWipes}
          tiers={tiers}
          onCancel={() => setWipeOpen(false)}
          onConfirm={(note) => {
            void completeWipe(account.id, note);
            setWipeOpen(false);
            setTab("run");
          }}
        />
      )}
    </>
  );
}
