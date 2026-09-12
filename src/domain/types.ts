export type ItemKind = "check" | "count";
export type Phase = "gaia" | "khei";

export interface TemplateItem {
  tid: string;
  label: string;
  kind: ItemKind;
  target: number;
  threshold: number;
  group: string;
  note: string;
}

export interface Template {
  gaia: TemplateItem[];
  khei: TemplateItem[];
}

export interface ChecklistItem {
  id: string;
  tid: string;
  label: string;
  kind: ItemKind;
  target: number;
  threshold: number;
  group: string;
  note: string;
  done: boolean;
  current: number;
}

export interface Checklist {
  gaia: ChecklistItem[];
  khei: ChecklistItem[];
}

export interface WipeHistoryEntry {
  id: string;
  date: string;
  wipeNumber: number;
  tierAfter: number;
  note: string;
  snapshot: Checklist;
}

export interface Account {
  id: string;
  name: string;
  totalWipes: number;
  checklist: Checklist;
  history: WipeHistoryEntry[];
}

export interface CompleteWipeResult {
  account: Account;
  historyEntry: WipeHistoryEntry;
}
