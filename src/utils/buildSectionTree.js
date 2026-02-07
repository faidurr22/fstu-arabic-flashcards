export default function buildSectionTree(data) {
  const tree = [];
  const sectionMap = {};
  data.forEach((d) => {
    if (!sectionMap[d.section]) {
      sectionMap[d.section] = { name: d.section, parts: {}, partOrder: [] };
      tree.push(sectionMap[d.section]);
    }
    const sec = sectionMap[d.section];
    if (!sec.parts[d.part]) {
      sec.parts[d.part] = { name: d.part, cards: [], grammarCount: 0, vocabCount: 0 };
      sec.partOrder.push(d.part);
    }
    sec.parts[d.part].cards.push(d);
    if (d.type === "grammar") sec.parts[d.part].grammarCount++;
    else sec.parts[d.part].vocabCount++;
  });
  return tree;
}
