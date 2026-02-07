/**
 * Tests for the filtering logic used in StudyView.
 * Since the filtering is inline in the component, we replicate it here
 * as a pure function to test independently.
 */

const SAMPLE_DATA = [
  { section: "Unit 1", part: "Part 1: Nouns", type: "grammar", english: "nominative", arabic: "مَرْفُوْع" },
  { section: "Unit 1", part: "Part 1: Nouns", type: "vocab", english: "book", arabic: "كِتَاب" },
  { section: "Unit 1", part: "Part 2: Verbs", type: "grammar", english: "past tense", arabic: "مَاضِي" },
  { section: "Unit 2", part: "Introduction", type: "grammar", english: "verb", arabic: "فِعْل" },
  { section: "Unit 2", part: "Part 1: Particles", type: "vocab", english: "in", arabic: "فِي" },
];

function filterCards(data, { section = "all", part = "all", type = "all" } = {}) {
  let items = data;
  if (section !== "all") items = items.filter((d) => d.section === section);
  if (part !== "all") items = items.filter((d) => d.part === part);
  if (type !== "all") items = items.filter((d) => d.type === type);
  return items;
}

function getAvailableParts(data, selectedSection) {
  if (selectedSection === "all") return [...new Set(data.map((d) => d.part))].sort();
  return [...new Set(data.filter((d) => d.section === selectedSection).map((d) => d.part))].sort();
}

describe("filterCards", () => {
  it("returns all cards with no filters", () => {
    expect(filterCards(SAMPLE_DATA)).toHaveLength(5);
  });

  it("filters by section", () => {
    const result = filterCards(SAMPLE_DATA, { section: "Unit 1" });
    expect(result).toHaveLength(3);
    expect(result.every((d) => d.section === "Unit 1")).toBe(true);
  });

  it("filters by part", () => {
    const result = filterCards(SAMPLE_DATA, { part: "Part 1: Nouns" });
    expect(result).toHaveLength(2);
  });

  it("filters by type", () => {
    const grammar = filterCards(SAMPLE_DATA, { type: "grammar" });
    expect(grammar).toHaveLength(3);

    const vocab = filterCards(SAMPLE_DATA, { type: "vocab" });
    expect(vocab).toHaveLength(2);
  });

  it("combines section and type filters", () => {
    const result = filterCards(SAMPLE_DATA, { section: "Unit 1", type: "grammar" });
    expect(result).toHaveLength(2);
  });

  it("combines all three filters", () => {
    const result = filterCards(SAMPLE_DATA, {
      section: "Unit 1",
      part: "Part 1: Nouns",
      type: "grammar",
    });
    expect(result).toHaveLength(1);
    expect(result[0].english).toBe("nominative");
  });

  it("returns empty for non-matching filters", () => {
    const result = filterCards(SAMPLE_DATA, { section: "Unit 99" });
    expect(result).toHaveLength(0);
  });
});

describe("getAvailableParts", () => {
  it("returns all unique parts when section is 'all'", () => {
    const parts = getAvailableParts(SAMPLE_DATA, "all");
    expect(parts).toHaveLength(4);
    expect(parts).toContain("Part 1: Nouns");
    expect(parts).toContain("Part 1: Particles");
    expect(parts).toContain("Part 2: Verbs");
    expect(parts).toContain("Introduction");
  });

  it("returns parts only for selected section", () => {
    const parts = getAvailableParts(SAMPLE_DATA, "Unit 1");
    expect(parts).toHaveLength(2);
    expect(parts).toContain("Part 1: Nouns");
    expect(parts).toContain("Part 2: Verbs");
  });

  it("returns parts sorted alphabetically", () => {
    const parts = getAvailableParts(SAMPLE_DATA, "all");
    expect(parts).toEqual([...parts].sort());
  });

  it("returns empty for non-existent section", () => {
    expect(getAvailableParts(SAMPLE_DATA, "Unit 99")).toHaveLength(0);
  });
});
