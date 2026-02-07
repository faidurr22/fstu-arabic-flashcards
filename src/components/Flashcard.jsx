import theme from "../theme";

export default function Flashcard({ card, flipped, onFlip }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onFlip();
    }
  };

  return (
    <div
      className="flashcard-container"
      onClick={onFlip}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={
        flipped
          ? `Arabic: ${card.arabic}, English: ${card.english}. Press Enter to flip back.`
          : `English: ${card.english}. Press Enter to reveal Arabic.`
      }
      style={{
        perspective: "1200px",
        width: "100%",
        maxWidth: 440,
        height: 280,
        margin: "0 auto",
        cursor: "pointer",
        userSelect: "none",
        outline: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front - English */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            borderRadius: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: theme.gradients.cardFront,
            border: `1px solid ${theme.colors.borderLight}`,
            boxShadow: theme.shadows.card,
          }}
        >
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 3,
              color: theme.colors.primary,
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            English
          </div>
          <div
            className="flashcard-front-text"
            style={{ fontSize: 26, fontWeight: 700, color: theme.colors.text, textAlign: "center", lineHeight: 1.3 }}
          >
            {card.english}
          </div>
          <div style={{ fontSize: 12, color: theme.colors.textSubtle, marginTop: 24 }}>tap to reveal</div>
        </div>

        {/* Back - Arabic */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: theme.gradients.cardBack,
            border: `1px solid ${theme.colors.borderAccent}`,
            boxShadow: theme.shadows.card,
          }}
        >
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 3,
              color: theme.colors.primary,
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            &#1575;&#1604;&#1593;&#1585;&#1576;&#1610;&#1577;
          </div>
          <div
            className="flashcard-arabic-text"
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: theme.colors.text,
              textAlign: "center",
              direction: "rtl",
              lineHeight: 1.5,
            }}
          >
            {card.arabic}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 20 }}>{card.english}</div>
        </div>
      </div>
    </div>
  );
}
