import type {
  Account,
  Checklist,
  ChecklistItem,
  CompleteWipeResult,
  Phase,
  Template,
  TemplateItem,
  WipeHistoryEntry,
} from "./types";

export const uid = (): string => Math.random().toString(36).slice(2, 10);

export const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

export function runItem(t: TemplateItem): ChecklistItem {
  return {
    id: uid(),
    tid: t.tid,
    label: t.label,
    kind: t.kind,
    target: t.target,
    threshold: t.threshold,
    group: t.group,
    note: t.note,
    done: false,
    current: 0,
  };
}

export function freshChecklist(template: Template): Checklist {
  return {
    gaia: template.gaia.map(runItem),
    khei: template.khei.map(runItem),
  };
}

export function isDone(item: ChecklistItem): boolean {
  if (item.kind === "check") return !!item.done;
  const need = item.threshold || item.target || 1;
  return item.current >= need;
}

export function phaseProgress(items: ChecklistItem[]): { done: number; total: number } {
  return { done: items.filter(isDone).length, total: items.length };
}

export function tierOf(wipes: number, tiers: number[]): number {
  return tiers.filter((t) => wipes >= t).length;
}

export function nextTier(wipes: number, tiers: number[]): number | undefined {
  return tiers.find((t) => t > wipes);
}

export function setCurrent(item: ChecklistItem, value: number): ChecklistItem {
  return { ...item, current: Math.max(0, Math.floor(value) || 0) };
}

export function stepCurrent(item: ChecklistItem, delta: number): ChecklistItem {
  return { ...item, current: Math.max(0, item.current + delta) };
}

export function toggleDone(item: ChecklistItem): ChecklistItem {
  return { ...item, done: !item.done };
}

export function updateItemInPhase(
  items: ChecklistItem[],
  next: ChecklistItem,
): ChecklistItem[] {
  return items.map((i) => (i.id === next.id ? next : i));
}

export function completeWipe(
  account: Account,
  template: Template,
  tiers: number[],
  note: string,
): CompleteWipeResult {
  const snapshot = clone(account.checklist);
  const wipeNumber = account.totalWipes + 1;
  const historyEntry: WipeHistoryEntry = {
    id: uid(),
    date: new Date().toISOString(),
    wipeNumber,
    tierAfter: tierOf(wipeNumber, tiers),
    note,
    snapshot,
  };
  const updatedAccount: Account = {
    ...account,
    totalWipes: wipeNumber,
    history: [historyEntry, ...account.history],
    checklist: freshChecklist(template),
  };
  return { account: updatedAccount, historyEntry };
}

export function resetLife(account: Account, template: Template): Account {
  return { ...account, checklist: freshChecklist(template) };
}

export function newAccount(name: string, template: Template): Account {
  return {
    id: uid(),
    name,
    totalWipes: 0,
    checklist: freshChecklist(template),
    history: [],
  };
}

export function groupProgress(
  items: ChecklistItem[],
): Array<[string, { done: number; total: number }]> {
  const m = new Map<string, { done: number; total: number }>();
  for (const it of items) {
    if (!it.group) continue;
    const g = m.get(it.group) || { done: 0, total: 0 };
    g.total += 1;
    if (isDone(it)) g.done += 1;
    m.set(it.group, g);
  }
  return Array.from(m.entries());
}

export function reorderTemplateItems(
  items: TemplateItem[],
  index: number,
  direction: -1 | 1,
): TemplateItem[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = items.slice();
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}

export type { Phase };
