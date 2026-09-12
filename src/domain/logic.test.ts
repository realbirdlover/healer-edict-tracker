import { describe, expect, it } from "vitest";
import {
  clone,
  completeWipe,
  freshChecklist,
  groupProgress,
  isDone,
  newAccount,
  nextTier,
  phaseProgress,
  reorderTemplateItems,
  resetLife,
  setCurrent,
  stepCurrent,
  tierOf,
  toggleDone,
  updateItemInPhase,
} from "./logic";
import { seedTemplate } from "./seedTemplate";
import type { Account, Template, TemplateItem } from "./types";

const TIERS = [1, 5, 10];

function miniTemplate(): Template {
  return {
    gaia: [
      { tid: "g1", label: "Spell A", kind: "check", target: 1, threshold: 1, group: "Spell", note: "" },
      { tid: "g2", label: "Feeds", kind: "count", target: 60, threshold: 50, group: "", note: "" },
    ],
    khei: [
      { tid: "k1", label: "Uber title", kind: "check", target: 1, threshold: 1, group: "Title", note: "" },
      { tid: "k2", label: "Spire deaths", kind: "count", target: 5, threshold: 5, group: "", note: "" },
    ],
  };
}

describe("tierOf / nextTier", () => {
  it("computes the tier reached for a wipe count", () => {
    expect(tierOf(0, TIERS)).toBe(0);
    expect(tierOf(1, TIERS)).toBe(1);
    expect(tierOf(4, TIERS)).toBe(1);
    expect(tierOf(5, TIERS)).toBe(2);
    expect(tierOf(10, TIERS)).toBe(3);
    expect(tierOf(99, TIERS)).toBe(3);
  });

  it("finds the next tier threshold, or undefined once maxed", () => {
    expect(nextTier(0, TIERS)).toBe(1);
    expect(nextTier(3, TIERS)).toBe(5);
    expect(nextTier(10, TIERS)).toBeUndefined();
  });
});

describe("isDone / phaseProgress", () => {
  it("a check item is done only when its done flag is set", () => {
    const tpl = miniTemplate();
    const [item] = freshChecklist(tpl).gaia;
    expect(isDone(item)).toBe(false);
    expect(isDone(toggleDone(item))).toBe(true);
  });

  it("a count item is done once current reaches the real threshold, not the target", () => {
    const tpl = miniTemplate();
    const [, feeds] = freshChecklist(tpl).gaia;
    expect(feeds.threshold).toBe(50);
    expect(feeds.target).toBe(60);
    expect(isDone(setCurrent(feeds, 49))).toBe(false);
    expect(isDone(setCurrent(feeds, 50))).toBe(true);
    expect(isDone(setCurrent(feeds, 60))).toBe(true);
  });

  it("summarizes done/total across a phase", () => {
    const tpl = miniTemplate();
    const list = freshChecklist(tpl);
    expect(phaseProgress(list.gaia)).toEqual({ done: 0, total: 2 });
    const withOneDone = updateItemInPhase(list.gaia, toggleDone(list.gaia[0]));
    expect(phaseProgress(withOneDone)).toEqual({ done: 1, total: 2 });
  });
});

describe("counter math", () => {
  it("setCurrent clamps to zero and floors fractional input", () => {
    const tpl = miniTemplate();
    const [, feeds] = freshChecklist(tpl).gaia;
    expect(setCurrent(feeds, -5).current).toBe(0);
    expect(setCurrent(feeds, 12.9).current).toBe(12);
    expect(setCurrent(feeds, Number.NaN).current).toBe(0);
  });

  it("stepCurrent increments and decrements without going below zero", () => {
    const tpl = miniTemplate();
    const [, feeds] = freshChecklist(tpl).gaia;
    const at0 = stepCurrent(feeds, -1);
    expect(at0.current).toBe(0);
    const at3 = stepCurrent(stepCurrent(stepCurrent(feeds, 1), 1), 1);
    expect(at3.current).toBe(3);
    expect(stepCurrent(at3, -1).current).toBe(2);
  });

  it("does not mutate the original item", () => {
    const tpl = miniTemplate();
    const [, feeds] = freshChecklist(tpl).gaia;
    const bumped = stepCurrent(feeds, 1);
    expect(feeds.current).toBe(0);
    expect(bumped.current).toBe(1);
  });
});

describe("freshChecklist / template reset", () => {
  it("builds run items with independent ids, done:false, current:0", () => {
    const tpl = miniTemplate();
    const list = freshChecklist(tpl);
    expect(list.gaia).toHaveLength(2);
    expect(list.khei).toHaveLength(2);
    for (const it of [...list.gaia, ...list.khei]) {
      expect(it.done).toBe(false);
      expect(it.current).toBe(0);
    }
    const ids = new Set([...list.gaia, ...list.khei].map((i) => i.id));
    expect(ids.size).toBe(4);
  });

  it("resetLife replaces the checklist from the template and drops all progress", () => {
    const tpl = miniTemplate();
    let account = newAccount("Main", tpl);
    account = {
      ...account,
      checklist: {
        ...account.checklist,
        gaia: updateItemInPhase(account.checklist.gaia, toggleDone(account.checklist.gaia[0])),
      },
    };
    expect(phaseProgress(account.checklist.gaia).done).toBe(1);
    const reset = resetLife(account, tpl);
    expect(phaseProgress(reset.checklist.gaia).done).toBe(0);
    expect(reset.totalWipes).toBe(0);
    expect(reset.history).toEqual([]);
  });

  it("seedTemplate produces the documented Gaia and Khei items", () => {
    const tpl = seedTemplate();
    expect(tpl.gaia.map((i) => i.label)).toContain("Armis");
    expect(tpl.gaia.map((i) => i.label)).toContain("Health Potion force-feeds");
    expect(tpl.khei.map((i) => i.label)).toContain("Spire deaths");
    const feeds = tpl.gaia.find((i) => i.label === "Health Potion force-feeds")!;
    expect(feeds.target).toBe(60);
    expect(feeds.threshold).toBe(50);
  });
});

describe("wipe archiving", () => {
  it("archives a frozen snapshot, bumps totalWipes, and resets the checklist", () => {
    const tpl = miniTemplate();
    let account = newAccount("Main", tpl);
    account = {
      ...account,
      checklist: {
        ...account.checklist,
        gaia: updateItemInPhase(account.checklist.gaia, toggleDone(account.checklist.gaia[0])),
      },
    };

    const { account: after, historyEntry } = completeWipe(account, tpl, TIERS, "first run");

    expect(after.totalWipes).toBe(1);
    expect(after.history).toHaveLength(1);
    expect(after.history[0]).toBe(historyEntry);
    expect(historyEntry.wipeNumber).toBe(1);
    expect(historyEntry.tierAfter).toBe(1);
    expect(historyEntry.note).toBe("first run");
    expect(historyEntry.snapshot.gaia[0].done).toBe(true);

    expect(phaseProgress(after.checklist.gaia).done).toBe(0);
    expect(after.checklist.gaia[0].id).not.toBe(account.checklist.gaia[0].id);
  });

  it("computes tierAfter correctly across multiple wipes", () => {
    const tpl = miniTemplate();
    let account = newAccount("Main", tpl);
    for (let i = 0; i < 4; i++) {
      account = completeWipe(account, tpl, TIERS, "").account;
    }
    expect(account.totalWipes).toBe(4);
    const fifth = completeWipe(account, tpl, TIERS, "");
    expect(fifth.historyEntry.wipeNumber).toBe(5);
    expect(fifth.historyEntry.tierAfter).toBe(2);
  });

  it("keeps the archived snapshot unchanged when the template is edited afterward", () => {
    const tpl = miniTemplate();
    let account = newAccount("Main", tpl);
    account = {
      ...account,
      checklist: {
        ...account.checklist,
        gaia: updateItemInPhase(account.checklist.gaia, setCurrent(account.checklist.gaia[1], 42)),
      },
    };

    const { account: afterWipe } = completeWipe(account, tpl, TIERS, "before edit");
    const frozenBefore = clone(afterWipe.history[0]);

    // Mutate the template in place, and via reassignment, after the wipe is archived.
    (tpl.gaia[1] as TemplateItem).label = "Renamed feeds";
    (tpl.gaia[1] as TemplateItem).target = 999;
    tpl.gaia.push({
      tid: "new-item",
      label: "New spell added later",
      kind: "check",
      target: 1,
      threshold: 1,
      group: "Spell",
      note: "",
    });

    // The archived history entry must not reflect any of that.
    expect(afterWipe.history[0]).toEqual(frozenBefore);
    expect(afterWipe.history[0].snapshot.gaia[1].label).toBe("Feeds");
    expect(afterWipe.history[0].snapshot.gaia[1].current).toBe(42);
    expect(afterWipe.history[0].snapshot.gaia).toHaveLength(2);

    // A later reset/wipe, however, should pick up the edited template.
    const resetAfterEdit = resetLife(afterWipe, tpl);
    expect(resetAfterEdit.checklist.gaia).toHaveLength(3);
    expect(resetAfterEdit.checklist.gaia.map((i) => i.label)).toContain("New spell added later");
  });
});

describe("groupProgress", () => {
  it("tallies done/total per group, ignoring ungrouped items", () => {
    const tpl = seedTemplate();
    const list = freshChecklist(tpl);
    const groups = groupProgress(list.gaia);
    const spellGroup = groups.find(([g]) => g === "Spell");
    expect(spellGroup).toBeDefined();
    expect(spellGroup![1].total).toBe(15);
    expect(spellGroup![1].done).toBe(0);
  });
});

describe("reorderTemplateItems", () => {
  it("moves an item up or down and leaves order unchanged at the edges", () => {
    const tpl = miniTemplate();
    const moved = reorderTemplateItems(tpl.gaia, 0, 1);
    expect(moved.map((i) => i.tid)).toEqual(["g2", "g1"]);
    const noop = reorderTemplateItems(tpl.gaia, 0, -1);
    expect(noop.map((i) => i.tid)).toEqual(["g1", "g2"]);
  });
});

describe("account creation", () => {
  it("starts a new account at zero wipes with a fresh checklist from the given template", () => {
    const tpl = miniTemplate();
    const account: Account = newAccount("Alt", tpl);
    expect(account.name).toBe("Alt");
    expect(account.totalWipes).toBe(0);
    expect(account.history).toEqual([]);
    expect(account.checklist.gaia).toHaveLength(2);
  });
});
