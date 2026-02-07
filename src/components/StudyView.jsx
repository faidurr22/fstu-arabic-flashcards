import { useState, useMemo, useEffect, useRef } from "react";
import Flashcard from "./Flashcard";
import shuffleArray from "../utils/shuffle";
import theme, { styles } from "../theme";

export default function StudyView({ data, sections }) {
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedPart, setSelectedPart] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const availableParts = useMemo(() => {
    if (selectedSection === "all") return [...new Set(data.map((d) => d.part))].sort();
    return [
      ...new Set(data.filter((d) => d.section === selectedSection).map((d) => d.part)),
    ].sort();
  }, [selectedSection, data]);

  const filtered = useMemo(() => {
    let items = data;
    if (selectedSection !== "all") items = items.filter((d) => d.section === selectedSection);
    if (selectedPart !== "all") items = items.filter((d) => d.part === selectedPart);
    if (selectedType !== "all") items = items.filter((d) => d.type === selectedType);
    return shuffled ? shuffleArray(items) : items;
  }, [selectedSection, selectedPart, selectedType, shuffled, data]);

  const card = filtered[currentIndex] || null;
  const total = filtered.length;

  const navigate = (direction) => {
    setFlipped(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentIndex((i) =>
        direction === "next" ? (i + 1) % total : (i - 1 + total) % total
      );
    }, 120);
  };

  useEffect(() => {
    if (showTable) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") navigate("prev");
      else if (e.key === "ArrowRight") navigate("next");
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const resetView = (overrides = {}) => {
    setCurrentIndex(0);
    setFlipped(false);
    Object.entries(overrides).forEach(([key, val]) => {
      if (key === "section") {
        setSelectedSection(val);
        setSelectedPart("all");
      }
      if (key === "part") setSelectedPart(val);
      if (key === "type") setSelectedType(val);
    });
  };

  const typeColors = {
    all: { bg: theme.colors.primaryBg, color: theme.colors.primary },
    grammar: { bg: theme.colors.grammarBg, color: theme.colors.grammarText },
    vocab: { bg: theme.colors.vocabBg, color: theme.colors.vocabText },
  };

  return (
    <div
      style={{ minHeight: "100vh", background: theme.colors.bgDark, color: theme.colors.text }}
      role="region"
      aria-label="Study mode"
    >
      {/* Filters */}
      <div
        className="filter-bar"
        style={{
          padding: "16px 20px",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          borderBottom: `1px solid ${theme.colors.borderSubtle}`,
        }}
        role="toolbar"
        aria-label="Card filters"
      >
        <select
          value={selectedSection}
          onChange={(e) => resetView({ section: e.target.value })}
          aria-label="Select unit"
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: `1px solid ${theme.colors.borderInput}`,
            background: theme.colors.bgInput,
            color: theme.colors.text,
            fontSize: 13,
            outline: "none",
          }}
        >
          <option value="all">All Units</option>
          {sections.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={selectedPart}
          onChange={(e) => resetView({ part: e.target.value })}
          aria-label="Select part"
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: `1px solid ${theme.colors.borderInput}`,
            background: theme.colors.bgInput,
            color: theme.colors.text,
            fontSize: 13,
            outline: "none",
            maxWidth: 240,
          }}
        >
          <option value="all">All Parts</option>
          {availableParts.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <div className="type-filter-group" style={{ display: "flex", gap: 4 }} role="radiogroup" aria-label="Card type filter">
          {["all", "grammar", "vocab"].map((t) => (
            <button
              key={t}
              onClick={() => resetView({ type: t })}
              role="radio"
              aria-checked={selectedType === t}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "none",
                background: selectedType === t ? typeColors[t].bg : theme.colors.bgOverlayLight,
                color: selectedType === t ? typeColors[t].color : theme.colors.textDim,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setShuffled(!shuffled);
            setCurrentIndex(0);
            setFlipped(false);
          }}
          aria-label={shuffled ? "Disable shuffle" : "Enable shuffle"}
          aria-pressed={shuffled}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: "none",
            background: shuffled ? theme.colors.orangeBg : theme.colors.bgOverlayLight,
            color: shuffled ? theme.colors.orange : theme.colors.textDim,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          &#128256;
        </button>

        <button
          onClick={() => setShowTable(!showTable)}
          aria-label={showTable ? "Switch to card view" : "Switch to table view"}
          aria-pressed={showTable}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: "none",
            background: showTable ? "rgba(233,69,96,0.15)" : theme.colors.bgOverlayLight,
            color: showTable ? theme.colors.primary : theme.colors.textDim,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {showTable ? "\u25C6 Cards" : "\u2630 Table"}
        </button>

        <div
          style={{ marginLeft: "auto", fontSize: 12, color: theme.colors.textDimmer }}
          aria-live="polite"
        >
          {total} cards
        </div>
      </div>

      {/* Table View */}
      {showTable ? (
        <div className="table-view" style={{ padding: "12px 20px", overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
            role="table"
            aria-label="Flashcard data table"
          >
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.colors.borderAccent}` }}>
                {["#", "Section", "Part", "Type", "Arabic", "English"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    style={{
                      padding: "10px 10px",
                      textAlign: h === "Arabic" ? "right" : "left",
                      color: theme.colors.primary,
                      fontWeight: 700,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: `1px solid rgba(255,255,255,0.04)`,
                    background: i % 2 === 0 ? "transparent" : theme.colors.bgOverlaySubtle,
                  }}
                >
                  <td style={{ padding: "7px 10px", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                    {i + 1}
                  </td>
                  <td
                    style={{
                      padding: "7px 10px",
                      color: theme.colors.textSoft,
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.section}
                  </td>
                  <td style={{ padding: "7px 10px", color: theme.colors.textMuted, fontSize: 12 }}>
                    {c.part}
                  </td>
                  <td style={{ padding: "7px 10px" }}>
                    <span style={styles.typeBadge(c.type)}>{c.type}</span>
                  </td>
                  <td
                    className="table-arabic-cell"
                    style={{ padding: "7px 10px", direction: "rtl", fontSize: 18, fontWeight: 600 }}
                  >
                    {c.arabic}
                  </td>
                  <td style={{ padding: "7px 10px", color: theme.colors.textBright }}>
                    {c.english}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card View */
        <div style={{ padding: "32px 20px" }}>
          {card ? (
            <>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 20,
                  display: "flex",
                  gap: 6,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    padding: "3px 10px",
                    borderRadius: 8,
                    background: theme.colors.bgOverlayLight,
                    color: theme.colors.textMuted,
                  }}
                >
                  {card.section}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    padding: "3px 10px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                    color: theme.colors.textDimmer,
                  }}
                >
                  {card.part}
                </span>
                <span style={styles.typeBadge(card.type)}>{card.type}</span>
              </div>

              <Flashcard card={card} flipped={flipped} onFlip={() => setFlipped(!flipped)} />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  marginTop: 28,
                }}
              >
                <button
                  className="nav-button"
                  onClick={() => navigate("prev")}
                  aria-label="Previous card"
                  style={{ ...styles.navButton, ...styles.navButtonSmall }}
                >
                  &#8592;
                </button>
                <div
                  style={{
                    fontSize: 14,
                    color: theme.colors.textDim,
                    fontWeight: 600,
                    minWidth: 80,
                    textAlign: "center",
                  }}
                  aria-live="polite"
                >
                  {currentIndex + 1} / {total}
                </div>
                <button
                  className="nav-button"
                  onClick={() => navigate("next")}
                  aria-label="Next card"
                  style={{ ...styles.navButton, ...styles.navButtonSmall }}
                >
                  &#8594;
                </button>
              </div>

              <div
                style={{
                  maxWidth: 440,
                  margin: "24px auto 0",
                  ...styles.progressBar.container(3),
                }}
                role="progressbar"
                aria-valuenow={currentIndex + 1}
                aria-valuemin={1}
                aria-valuemax={total}
              >
                <div style={styles.progressBar.fill(((currentIndex + 1) / total) * 100)} />
              </div>

              {/* Keyboard hint */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: 16,
                  fontSize: 11,
                  color: theme.colors.textFaint,
                }}
                aria-hidden="true"
              >
                &#8592;&#8594; navigate &middot; Space flip
              </div>
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: theme.colors.textDimmer,
              }}
            >
              No cards match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
