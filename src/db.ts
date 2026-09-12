import Dexie, { type Table } from "dexie";
import type { Account, Template } from "./domain/types";

export interface SettingsRow {
  id: "app";
  tiers: number[];
  template: Template;
  activeAccountId: string | null;
}

export class HealerDB extends Dexie {
  accounts!: Table<Account, string>;
  settings!: Table<SettingsRow, string>;

  constructor() {
    super("healer-edict-tracker");
    this.version(1).stores({
      accounts: "id",
      settings: "id",
    });
  }
}

export const db = new HealerDB();
