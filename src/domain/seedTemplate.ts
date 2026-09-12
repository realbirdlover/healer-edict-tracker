import type { Template, TemplateItem } from "./types";
import { uid } from "./logic";

const SPELLS = [
  "Armis",
  "Celeritas",
  "Ignis",
  "Nocere",
  "Sagitta Sol",
  "Scrupus",
  "Telorum",
  "Trahere",
  "Trickstus",
  "Velo",
  "Viribus",
  "Gelidus",
  "Convivium",
  "Igleti",
  "Zindys",
];

function check(label: string, group = "", note = ""): TemplateItem {
  return { tid: uid(), label, kind: "check", target: 1, threshold: 1, group, note };
}

function count(
  label: string,
  target: number,
  threshold: number,
  note = "",
  group = "",
): TemplateItem {
  return { tid: uid(), label, kind: "count", target, threshold, group, note };
}

export function seedTemplate(): Template {
  return {
    gaia: [
      check("Rem's Passive", "Quest"),
      check("Sick girl quest, with Health Potion", "Quest"),
      ...SPELLS.map((s) => check(s, "Spell")),
      count("Ultra skill", 1, 1, "", "Skill"),
      count(
        "Health Potion force-feeds",
        60,
        50,
        "Feed past the requirement. The counter doesn't always register, so edit it by hand if the game and the list disagree.",
        "",
      ),
    ],
    khei: [
      check("Uber title", "Title"),
      count(
        "Spire deaths",
        5,
        5,
        "Looks like it's about the blessings more than rings of purity.",
        "",
      ),
    ],
  };
}
