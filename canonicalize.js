#!/usr/bin/env node
/**
 * Canonicalize FSTU Flashcards JSON (v1.0)
 *
 * Reads src/data/flashcards.json, adds canonical fields per spec,
 * writes result back to the same file.
 */

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, 'src', 'data', 'flashcards.json');

// ── Arabic consonant map (bare letters → ASCII) ────────────────────
const CONSONANTS = {
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h',
  'ة': 'a',   // ta marbuta
  'ء': '',    // hamza – ignore
  'ئ': '',    // hamza on ya
  'ؤ': '',    // hamza on waw
};

// Unicode ranges for Arabic diacritics / tashkīl (to strip for arabicBare)
const DIACRITICS_RE = /[\u0610-\u061A\u064B-\u065F\u0670]/g;

function stripDiacritics(str) {
  return str.replace(DIACRITICS_RE, '');
}

/**
 * Transliterate Arabic text to a lowercase ASCII slug.
 *
 * Vowel-aware: reads diacritics (fatha→a, kasra→i, damma→u, tanwin→an/in/un)
 * and handles long-vowel patterns (وْ after u, ا after a, ي after i).
 * Collapses consecutive duplicate characters (shadda rule).
 */
function transliterate(arabic) {
  let result = '';
  let lastVowel = '';

  for (const ch of arabic) {
    const code = ch.charCodeAt(0);

    // ── Diacritics (harakat) ──
    if (code === 0x064E) {        // fatha  → a
      result += 'a'; lastVowel = 'a';
    } else if (code === 0x0650) { // kasra  → i
      result += 'i'; lastVowel = 'i';
    } else if (code === 0x064F) { // damma  → u
      result += 'u'; lastVowel = 'u';
    } else if (code === 0x0652) { // sukun  → nothing
      lastVowel = '';
    } else if (code === 0x0651) { // shadda → nothing (consonant already emitted)
      // skip
    } else if (code === 0x064B) { // fathatan (tanwin)
      result += 'an'; lastVowel = '';
    } else if (code === 0x064C) { // dammatan
      result += 'un'; lastVowel = '';
    } else if (code === 0x064D) { // kasratan
      result += 'in'; lastVowel = '';
    } else if (code >= 0x0610 && code <= 0x061A) {
      // other misc diacritics – skip
    } else if (code === 0x0670) {
      // superscript alef – skip
    }

    // ── Long-vowel letters (alif / waw / ya) ──
    else if (ch === 'ا' || ch === 'آ' || ch === 'أ' || ch === 'إ' || ch === 'ى') {
      if (lastVowel === 'a') {
        // long ā – already have 'a', skip
      } else if (ch === 'إ') {
        result += 'i'; lastVowel = 'i';
      } else {
        result += 'a'; lastVowel = 'a';
      }
    } else if (ch === 'و') {
      if (lastVowel === 'u') {
        // long ū – skip
      } else {
        result += 'w'; lastVowel = '';
      }
    } else if (ch === 'ي') {
      if (lastVowel === 'i') {
        // long ī – skip
      } else {
        result += 'y'; lastVowel = '';
      }
    }

    // ── Consonants ──
    else if (CONSONANTS[ch] !== undefined) {
      result += CONSONANTS[ch];
      lastVowel = '';
    }

    // ── ASCII lowercase passthrough ──
    else if (/[a-z]/.test(ch)) {
      result += ch; lastVowel = '';
    }
    // everything else (spaces, digits, punctuation) → skip
  }

  // collapse consecutive duplicate chars (shadda rule: "ss" → "s")
  result = result.replace(/(.)\1+/g, '$1');
  return result;
}

// ── segmentId helpers ───────────────────────────────────────────────

/**
 * Parse "Unit X" or "Unit X Section Y" into { unitNum, sectionNum }
 */
function parseSection(section) {
  // e.g. "Unit 3 Section 2"
  const m = section.match(/Unit\s+(\d+)(?:\s+Section\s+(\d+))?/i);
  if (!m) throw new Error(`Cannot parse section: "${section}"`);
  const unitNum = parseInt(m[1], 10);
  const sectionNum = m[2] ? parseInt(m[2], 10) : 0;
  return { unitNum, sectionNum };
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

// ── Grammar-term detection ──────────────────────────────────────────
// Arabic roots / words that are clearly grammar terms regardless of type field
const GRAMMAR_TERMS_BARE = new Set([
  'مرفوع', 'منصوب', 'مجرور', 'مجزوم',
  'اسم', 'فعل', 'حرف',
  // with plurals stripped
]);

function isGrammarTerm(arabicBare) {
  // Check if any token in the bare arabic matches known grammar terms
  const tokens = arabicBare.split(/\s+/);
  for (const t of tokens) {
    // Also try the first word before ج (plural marker)
    const base = t.replace(/\s*ج\s*.*$/, '').trim();
    if (GRAMMAR_TERMS_BARE.has(t) || GRAMMAR_TERMS_BARE.has(base)) {
      return true;
    }
  }
  return false;
}

// ── Main ────────────────────────────────────────────────────────────

const raw = fs.readFileSync(INPUT, 'utf8');
const cards = JSON.parse(raw);

// 1. Build segment → partNum mapping
//    For each section, assign sequential P## to each unique part in appearance order.
const sectionPartMap = new Map(); // key: section → Map<part, partNum>

for (const card of cards) {
  if (!sectionPartMap.has(card.section)) {
    sectionPartMap.set(card.section, new Map());
  }
  const parts = sectionPartMap.get(card.section);
  if (!parts.has(card.part)) {
    parts.set(card.part, parts.size + 1);
  }
}

// 2. Track introOrder per (section, part) group
const introOrderCounters = new Map(); // key: `${section}||${part}` → current count

// 3. Track used IDs for collision detection
const usedIds = new Map(); // slug → count

function makeUniqueId(prefix, slug) {
  const base = `${prefix}.${slug}`;
  if (!usedIds.has(base)) {
    usedIds.set(base, 1);
    return base;
  }
  const count = usedIds.get(base) + 1;
  usedIds.set(base, count);
  return `${base}_${count}`;
}

// 4. Transform each card
const output = cards.map((card) => {
  const { section, part, type, english, arabic } = card;

  // arabicBare
  const arabicBare = stripDiacritics(arabic);

  // itemType with classification override
  let itemType;
  if (type === 'grammar') {
    itemType = 'term';
  } else if (type === 'vocab' && isGrammarTerm(arabicBare)) {
    itemType = 'term';
  } else {
    itemType = 'vocab';
  }

  // id slug
  const prefix = itemType === 'term' ? 'fstu1.term' : 'fstu1.lex';
  const slug = transliterate(arabic);
  const id = makeUniqueId(prefix, slug || 'unknown');

  // segmentId
  const { unitNum, sectionNum } = parseSection(section);
  const partNum = sectionPartMap.get(section).get(part);
  const segmentId = `FSTU1-U${pad2(unitNum)}-S${pad2(sectionNum)}-P${pad2(partNum)}`;

  // introOrder
  const groupKey = `${section}||${part}`;
  const currentOrder = (introOrderCounters.get(groupKey) || 0) + 1;
  introOrderCounters.set(groupKey, currentOrder);

  return {
    // original fields preserved
    section,
    part,
    type,
    english,
    arabic,
    // canonical fields
    id,
    book: 'FSTU1',
    itemType,
    segmentId,
    introOrder: currentOrder,
    arabicDiacritics: arabic,
    arabicBare,
    clusters: [],
    posPrimary: null,
    notesShort: null,
    answerVariants: [],
    status: 'active',
  };
});

// 5. Validate
console.log(`Input cards:  ${cards.length}`);
console.log(`Output cards: ${output.length}`);

const allIds = output.map(c => c.id);
const uniqueIds = new Set(allIds);
console.log(`Unique IDs:   ${uniqueIds.size}`);
if (uniqueIds.size !== allIds.length) {
  console.error('ERROR: Duplicate IDs found!');
  const seen = new Map();
  for (const id of allIds) {
    seen.set(id, (seen.get(id) || 0) + 1);
  }
  for (const [id, count] of seen) {
    if (count > 1) console.error(`  ${id} appears ${count} times`);
  }
  process.exit(1);
}

// 6. Write
fs.writeFileSync(INPUT, JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(`Written to ${INPUT}`);
