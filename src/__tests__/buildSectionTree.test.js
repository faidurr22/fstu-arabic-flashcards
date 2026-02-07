import buildSectionTree from "../utils/buildSectionTree";

const SAMPLE_DATA = [
  { section: "Unit 1", part: "Part 1: Nouns", type: "grammar", english: "nominative", arabic: "مَرْفُوْع" },
  { section: "Unit 1", part: "Part 1: Nouns", type: "grammar", english: "accusative", arabic: "مَنْصُوْب" },
  { section: "Unit 1", part: "Part 2: Verbs", type: "vocab", english: "he went", arabic: "ذَهَبَ" },
  { section: "Unit 2", part: "Introduction", type: "grammar", english: "verb", arabic: "فِعْل" },
  { section: "Unit 2", part: "Introduction", type: "vocab", english: "noun", arabic: "اِسْم" },
];

describe("buildSectionTree", () => {
  let tree;

  beforeAll(() => {
    tree = buildSectionTree(SAMPLE_DATA);
  });

  it("creates correct number of sections", () => {
    expect(tree).toHaveLength(2);
  });

  it("preserves section names and order", () => {
    expect(tree[0].name).toBe("Unit 1");
    expect(tree[1].name).toBe("Unit 2");
  });

  it("creates correct parts per section", () => {
    expect(tree[0].partOrder).toEqual(["Part 1: Nouns", "Part 2: Verbs"]);
    expect(tree[1].partOrder).toEqual(["Introduction"]);
  });

  it("groups cards into correct parts", () => {
    expect(tree[0].parts["Part 1: Nouns"].cards).toHaveLength(2);
    expect(tree[0].parts["Part 2: Verbs"].cards).toHaveLength(1);
    expect(tree[1].parts["Introduction"].cards).toHaveLength(2);
  });

  it("counts grammar and vocab correctly", () => {
    const nouns = tree[0].parts["Part 1: Nouns"];
    expect(nouns.grammarCount).toBe(2);
    expect(nouns.vocabCount).toBe(0);

    const intro = tree[1].parts["Introduction"];
    expect(intro.grammarCount).toBe(1);
    expect(intro.vocabCount).toBe(1);
  });

  it("handles empty data", () => {
    expect(buildSectionTree([])).toEqual([]);
  });

  it("sets part name correctly", () => {
    expect(tree[0].parts["Part 1: Nouns"].name).toBe("Part 1: Nouns");
  });
});
