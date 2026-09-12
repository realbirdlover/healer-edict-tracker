import { useEffect, useState } from "react";
import { AccountsScreen } from "./components/AccountsScreen";
import { AccountView } from "./components/AccountView";
import { SettingsView } from "./components/SettingsView";
import { useStore } from "./store";

type View = "accounts" | "account" | "settings";

export default function App() {
  const ready = useStore((s) => s.ready);
  const init = useStore((s) => s.init);
  const accounts = useStore((s) => s.accounts);
  const activeAccountId = useStore((s) => s.activeAccountId);
  const selectAccount = useStore((s) => s.selectAccount);

  const [view, setView] = useState<View>("accounts");

  useEffect(() => {
    void init();
  }, [init]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-[680px] px-4 pb-20">
        <p className="mt-6 font-serif text-sm italic text-muted">Loading…</p>
      </div>
    );
  }

  const account = accounts.find((a) => a.id === activeAccountId) ?? accounts[0];

  return (
    <div className="mx-auto max-w-[680px] px-4 pb-20">
      {view === "accounts" && (
        <>
          <header className="pb-3.5 pt-5">
            <div className="font-serif text-[13px] italic text-muted">Rogue Lineage</div>
            <h1 className="mt-0.5 font-serif text-[26px] font-semibold">Healer Edict</h1>
            <p className="mt-2 text-[12.5px] text-muted">Pick an account to open its current life.</p>
          </header>
          <AccountsScreen
            onOpen={(id) => {
              selectAccount(id);
              setView("account");
            }}
            onSettings={() => setView("settings")}
          />
        </>
      )}

      {view === "settings" && (
        <>
          <header className="pb-3.5 pt-5">
            <button
              className="border-0 bg-none p-0 text-[13px] text-muted hover:text-bone"
              onClick={() => setView("accounts")}
            >
              ← Accounts
            </button>
            <h1 className="mt-0.5 font-serif text-[26px] font-semibold">Settings</h1>
          </header>
          <SettingsView />
        </>
      )}

      {view === "account" && account && (
        <AccountView account={account} onBack={() => setView("accounts")} />
      )}
    </div>
  );
}
