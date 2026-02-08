import { useState, useMemo, useEffect, useRef } from "react";
import Flashcard from "./Flashcard";
import Icons from "./Icons";
import shuffleArray from "../utils/shuffle";
import theme, { styles } from "../theme";

export default function FlashcardSession({ cards, title, subtitle, onBack, isLearnMode }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [known, setKnown] = useState(new Set());
  const timerRef = useRef(null);

  const deck = useMemo(
    () => (shuffled ? shuffleArray(cards) : cards),
    [cards, shuffled]
  );
  const total = deck.length;
  const card = deck[index] || null;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const navigate = (direction) => {
    setFlipped(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIndex((i) =>
        direction === "next" ? (i + 1) % total : (i - 1 + total) % total
      );
    }, 120);
  };

  const toggleKnown = () => {
    if (!card) return;
    const k = card.english + card.arabic;
    setKnown((prev) => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") navigate("prev");
      else if (e.key === "ArrowRight") navigate("next");
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "k" || e.key === "K") toggleKnown();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const isKnown = card ? known.has(card.english + card.arabic) : false;

  return (
    <div
      style={{ minHeight: "100vh", background: theme.colors.bgDark, color: theme.colors.text }}
      role="region"
      aria-label={`Flashcard session: ${title}`}
    >
      {/* Header */}
      <div
        className="session-header"
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: `1px solid ${theme.colors.borderSubtle}`,
        }}
      >
        <button
          onClick={() => onBack(false)}
          aria-label="Go back"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: `1px solid ${theme.colors.borderMedium}`,
            background: theme.colors.bgOverlayFaint,
            color: theme.colors.text,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {Icons.back}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: 12, color: theme.colors.textDim }}>{subtitle}</div>
          )}
        </div>
        <button
          onClick={() => {
            setShuffled(!shuffled);
            setIndex(0);
            setFlipped(false);
          }}
          aria-label={shuffled ? "Disable shuffle" : "Enable shuffle"}
          aria-pressed={shuffled}
          style={{
            padding: "6px 14px",
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
        <div
          style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}
          aria-label={`${known.size} of ${total} cards marked as known`}
        >
          {known.size}/{total}
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.progressBar.container(3)} role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}>
        <div style={styles.progressBar.fill(((index + 1) / total) * 100)} />
      </div>

      {card && (
        <div style={{ padding: "40px 20px 20px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span style={styles.typeBadge(card.type)}>{card.type}</span>
          </div>

          <Flashcard card={card} flipped={flipped} onFlip={() => setFlipped(!flipped)} />

          {/* Navigation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginTop: 32,
            }}
          >
            <button
              className="nav-button"
              onClick={() => navigate("prev")}
              aria-label="Previous card"
              style={{ ...styles.navButton, ...styles.navButtonLarge }}
            >
              &#8592;
            </button>
            <div
              style={{
                fontSize: 15,
                color: theme.colors.textDim,
                fontWeight: 700,
                minWidth: 80,
                textAlign: "center",
              }}
              aria-live="polite"
            >
              {index + 1} / {total}
            </div>
            <button
              className="nav-button"
              onClick={() => navigate("next")}
              aria-label="Next card"
              style={{ ...styles.navButton, ...styles.navButtonLarge }}
            >
              &#8594;
            </button>
          </div>

          {/* Known toggle */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <button
              onClick={toggleKnown}
              aria-label={isKnown ? "Unmark as known" : "Mark as known"}
              aria-pressed={isKnown}
              style={{
                padding: "10px 28px",
                borderRadius: 14,
                border: "none",
                background: isKnown ? theme.colors.greenBg : theme.colors.bgOverlayLight,
                color: isKnown ? theme.colors.green : "rgba(255,255,255,0.35)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {isKnown ? "\u2713 Known" : "Mark Known"}
            </button>
          </div>

          {/* Complete & Continue (learn mode) */}
          {isLearnMode && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
              <button
                onClick={() => onBack(true)}
                aria-label="Mark as complete and go back"
                style={{
                  padding: "14px 36px",
                  borderRadius: 16,
                  border: "none",
                  background: theme.gradients.gold,
                  color: "#5a3800",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 900,
                  letterSpacing: 0.5,
                  boxShadow: theme.shadows.goldActive,
                  transition: "transform 0.15s",
                }}
              >
                &#10003; Complete &amp; Continue
              </button>
            </div>
          )}

          {/* Keyboard hint */}
          <div
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 11,
              color: theme.colors.textFaint,
            }}
            aria-hidden="true"
          >
            &#8592;&#8594; navigate &middot; Space flip &middot; K mark known
          </div>
        </div>
      )}
    </div>
  );
}
