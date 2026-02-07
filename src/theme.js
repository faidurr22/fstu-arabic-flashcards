const theme = {
  colors: {
    primary: "#e94560",
    blue: "#63b3ed",
    green: "#48bb78",
    greenDark: "#38a169",
    orange: "#edbb63",
    gold: "#FFB800",
    goldDark: "#FF9500",
    goldBorder: "#FFD000",
    goldBorderDim: "#E8A300",

    bgDark: "#0a0a1a",
    bgCard: "#0f0f23",
    bgInput: "#12122a",
    bgCardGradientStart: "#1a1a2e",
    bgCardGradientMid: "#16213e",
    bgCardGradientEnd: "#0f3460",

    text: "#f5f5f5",
    textDim: "rgba(255,255,255,0.4)",
    textDimmer: "rgba(255,255,255,0.3)",
    textFaint: "rgba(255,255,255,0.15)",
    textSubtle: "rgba(255,255,255,0.25)",
    textMuted: "rgba(255,255,255,0.45)",
    textSoft: "rgba(255,255,255,0.5)",
    textBright: "rgba(255,255,255,0.75)",

    borderSubtle: "rgba(255,255,255,0.06)",
    borderLight: "rgba(255,255,255,0.08)",
    borderMedium: "rgba(255,255,255,0.1)",
    borderInput: "rgba(255,255,255,0.12)",
    borderAccent: "rgba(233,69,96,0.2)",

    bgOverlayFaint: "rgba(255,255,255,0.04)",
    bgOverlayLight: "rgba(255,255,255,0.05)",
    bgOverlaySubtle: "rgba(255,255,255,0.015)",

    grammarBg: "rgba(99,179,237,0.12)",
    grammarText: "#63b3ed",
    vocabBg: "rgba(72,187,120,0.12)",
    vocabText: "#48bb78",
    primaryBg: "rgba(233,69,96,0.2)",
    orangeBg: "rgba(237,187,99,0.2)",
    greenBg: "rgba(72,187,120,0.2)",
  },

  gradients: {
    cardFront: "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    cardBack: "linear-gradient(145deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)",
    progress: "linear-gradient(90deg, #e94560, #63b3ed)",
    gold: "linear-gradient(145deg, #FFB800 0%, #FF9500 100%)",
    goldBanner: "linear-gradient(135deg, #FF9500 0%, #FFB800 100%)",
    nodeActive: "linear-gradient(145deg, #FFB800 0%, #FF9500 100%)",
    nodeLocked: "linear-gradient(145deg, #2a2a3e 0%, #1e1e30 100%)",
    headerBg: "linear-gradient(180deg, rgba(233,69,96,0.06) 0%, transparent 100%)",
    verticalLine: "linear-gradient(180deg, rgba(255,184,0,0.15) 0%, rgba(255,255,255,0.04) 100%)",
  },

  shadows: {
    card: "0 20px 60px rgba(0,0,0,0.3)",
    goldActive: "0 6px 24px rgba(255,184,0,0.4)",
    goldDim: "0 4px 16px rgba(255,184,0,0.2)",
    goldBanner: "0 4px 20px rgba(255,150,0,0.3)",
    locked: "0 4px 12px rgba(0,0,0,0.3)",
    badge: "0 4px 12px rgba(0,0,0,0.2)",
  },
};

export const styles = {
  navButton: {
    borderRadius: 14,
    border: `1px solid ${theme.colors.borderMedium}`,
    background: theme.colors.bgOverlayFaint,
    color: theme.colors.text,
    fontSize: 20,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  navButtonSmall: {
    width: 48,
    height: 48,
  },

  navButtonLarge: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },

  typeBadge: (type) => ({
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 8,
    background: type === "grammar" ? theme.colors.grammarBg : theme.colors.vocabBg,
    color: type === "grammar" ? theme.colors.grammarText : theme.colors.vocabText,
    fontWeight: 600,
  }),

  filterButton: (isActive, activeColor = theme.colors.textDim) => ({
    padding: "8px 14px",
    borderRadius: 10,
    border: "none",
    background: isActive ? undefined : theme.colors.bgOverlayLight,
    color: isActive ? activeColor : theme.colors.textDim,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  }),

  progressBar: {
    container: (height = 3) => ({
      height,
      background: theme.colors.borderSubtle,
      borderRadius: 2,
      overflow: "hidden",
    }),
    fill: (percent) => ({
      height: "100%",
      width: `${percent}%`,
      background: theme.gradients.progress,
      borderRadius: 2,
      transition: "width 0.3s",
    }),
  },
};

export default theme;
