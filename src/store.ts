import { create } from "zustand";
import { db } from "./db";
import * as logic from "./domain/logic";
import { seedTemplate } from "./domain/seedTemplate";
import type { Account, Checklist, ChecklistItem, Phase, Template } from "./domain/types";

export interface ExportShape {
  version: 1;
  tiers: number[];
  template: Template;
  activeAccountId: string | null;
  accounts: Account[];
}

interface AppState {
  ready: boolean;
  tiers: number[];
  template: Template;
  accounts: Account[];
  activeAccountId: string | null;

  init: () => Promise<void>;
  activeAccount: () => Account | undefined;

  selectAccount: (id: string) => void;
  addAccount: (name: string) => Promise<void>;
  renameAccount: (id: string, name: string) => Promise<void>;
  setAccountWipes: (id: string, wipes: number) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  updateItem: (accountId: string, phase: Phase, item: ChecklistItem) => Promise<void>;
  resetLife: (accountId: string) => Promise<void>;
  completeWipe: (accountId: string, note: string) => Promise<void>;

  setTiers: (tiers: number[]) => Promise<void>;
  updateTemplate: (template: Template) => Promise<void>;

  exportData: () => ExportShape;
  importData: (data: ExportShape) => Promise<void>;
}

async function persistSettings(s: Pick<AppState, "tiers" | "template" | "activeAccountId">) {
  await db.settings.put({
    id: "app",
    tiers: s.tiers,
    template: s.template,
    activeAccountId: s.activeAccountId,
  });
}

async function persistAccount(a: Account) {
  await db.accounts.put(a);
}

export const useStore = create<AppState>((set, get) => ({
  ready: false,
  tiers: [1, 5, 10],
  template: seedTemplate(),
  accounts: [],
  activeAccountId: null,

  init: async () => {
    let settings = await db.settings.get("app");
    let accounts = await db.accounts.toArray();

    if (!settings || accounts.length === 0) {
      const template = settings?.template ?? seedTemplate();
      const tiers = settings?.tiers ?? [1, 5, 10];
      const seeded = accounts.length > 0 ? accounts : [logic.newAccount("Main", template)];
      settings = { id: "app", tiers, template, activeAccountId: seeded[0].id };
      accounts = seeded;
      await db.settings.put(settings);
      await Promise.all(accounts.map((a) => db.accounts.put(a)));
    }

    set({
      ready: true,
      tiers: settings.tiers,
      template: settings.template,
      accounts,
      activeAccountId: settings.activeAccountId ?? accounts[0]?.id ?? null,
    });
  },

  activeAccount: () => {
    const s = get();
    return s.accounts.find((a) => a.id === s.activeAccountId) ?? s.accounts[0];
  },

  selectAccount: (id) => {
    set({ activeAccountId: id });
    void persistSettings({ ...get(), activeAccountId: id });
  },

  addAccount: async (name) => {
    const account = logic.newAccount(name, get().template);
    set((s) => ({ accounts: [...s.accounts, account] }));
    await persistAccount(account);
  },

  renameAccount: async (id, name) => {
    let updated: Account | undefined;
    set((s) => ({
      accounts: s.accounts.map((a) => {
        if (a.id !== id) return a;
        updated = { ...a, name };
        return updated;
      }),
    }));
    if (updated) await persistAccount(updated);
  },

  setAccountWipes: async (id, wipes) => {
    let updated: Account | undefined;
    set((s) => ({
      accounts: s.accounts.map((a) => {
        if (a.id !== id) return a;
        updated = { ...a, totalWipes: Math.max(0, Math.floor(wipes) || 0) };
        return updated;
      }),
    }));
    if (updated) await persistAccount(updated);
  },

  deleteAccount: async (id) => {
    const s = get();
    if (s.accounts.length <= 1) return;
    const rest = s.accounts.filter((a) => a.id !== id);
    const activeAccountId = s.activeAccountId === id ? rest[0].id : s.activeAccountId;
    set({ accounts: rest, activeAccountId });
    await db.accounts.delete(id);
    await persistSettings({ ...get(), activeAccountId });
  },

  updateItem: async (accountId, phase, item) => {
    let updated: Account | undefined;
    set((s) => ({
      accounts: s.accounts.map((a) => {
        if (a.id !== accountId) return a;
        const checklist: Checklist = {
          ...a.checklist,
          [phase]: logic.updateItemInPhase(a.checklist[phase], item),
        };
        updated = { ...a, checklist };
        return updated;
      }),
    }));
    if (updated) await persistAccount(updated);
  },

  resetLife: async (accountId) => {
    const s = get();
    const account = s.accounts.find((a) => a.id === accountId);
    if (!account) return;
    const updated = logic.resetLife(account, s.template);
    set((st) => ({ accounts: st.accounts.map((a) => (a.id === accountId ? updated : a)) }));
    await persistAccount(updated);
  },

  completeWipe: async (accountId, note) => {
    const s = get();
    const account = s.accounts.find((a) => a.id === accountId);
    if (!account) return;
    const { account: updated } = logic.completeWipe(account, s.template, s.tiers, note);
    set((st) => ({ accounts: st.accounts.map((a) => (a.id === accountId ? updated : a)) }));
    await persistAccount(updated);
  },

  setTiers: async (tiers) => {
    set({ tiers });
    await persistSettings({ ...get(), tiers });
  },

  updateTemplate: async (template) => {
    set({ template });
    await persistSettings({ ...get(), template });
  },

  exportData: () => {
    const s = get();
    return {
      version: 1,
      tiers: s.tiers,
      template: s.template,
      activeAccountId: s.activeAccountId,
      accounts: s.accounts,
    };
  },

  importData: async (data) => {
    set({
      tiers: data.tiers,
      template: data.template,
      activeAccountId: data.activeAccountId,
      accounts: data.accounts,
    });
    await db.accounts.clear();
    await Promise.all(data.accounts.map((a) => db.accounts.put(a)));
    await persistSettings(data);
  },
}));
