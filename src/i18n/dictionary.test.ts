import { describe, expect, it } from "vitest";
import { dictionaries } from "./dictionary";

describe("localized interface", () => {
  it("keeps every locale structurally complete", () => {
    const englishKeys = Object.keys(dictionaries.en).sort();
    expect(Object.keys(dictionaries.fa).sort()).toEqual(englishKeys);
    expect(Object.keys(dictionaries.ar).sort()).toEqual(englishKeys);
  });

  it("provides Arabic labels and recommendations", () => {
    expect(dictionaries.ar.nav).toHaveLength(4);
    expect(dictionaries.ar.search).toContain("GitHub");
    expect(dictionaries.ar.suggestions.tests).toContain("الاختبارات");
  });
});
