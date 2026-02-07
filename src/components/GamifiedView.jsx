import { useState, useEffect, useCallback } from "react";
import SectionBanner from "./SectionBanner";
import Icons from "./Icons";
import { getNodeIcon } from "./Icons";
import theme from "../theme";

const STORAGE_KEY = "fstu_completed_parts";

function loadCompleted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // storage full or unavailable
  }
}

export default function GamifiedView({ sectionTree, onStartSession }) {
  const [completedParts, setCompletedParts] = useState(loadCompleted);

  useEffect(() => {
    saveCompleted(completedParts);
  }, [completedParts]);

  let activeKey = null;
  for (const section of sectionTree) {
    for (const partName of section.partOrder) {
      const key = section.name + "::" + partName;
      if (!completedParts.has(key)) {
        if (!activeKey) activeKey = key;
        break;
      }
    }
    if (activeKey) break;
  }
  if (!activeKey && sectionTree.length > 0) {
    const s = sectionTree[0];
    activeKey = s.name + "::" + s.partOrder[0];
  }

  const toggleComplete = useCallback((key) => {
    setCompletedParts((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }, []);

  let globalNodeIdx = 0;

  return (
    <div
      style={{ minHeight: "100vh", background: theme.colors.bgCard, paddingBottom: 100 }}
      role="navigation"
      aria-label="Learning path"
    >
      {sectionTree.map((section, sIdx) => {
        let sectionCompleted = 0;
        section.partOrder.forEach((p) => {
          if (completedParts.has(section.name + "::" + p)) sectionCompleted++;
        });
        let foundActiveInSection = false;

        return (
          <div key={section.name}>
            <div style={{ paddingTop: sIdx === 0 ? 20 : 40 }}>
              <SectionBanner
                section={section}
                sIdx={sIdx}
                completedCount={sectionCompleted}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 28,
                padding: "24px 0",
                position: "relative",
              }}
            >
              {/* Vertical line */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "50%",
                  width: 3,
                  marginLeft: -1.5,
                  background: theme.gradients.verticalLine,
                  borderRadius: 2,
                  zIndex: 0,
                }}
              />

              {section.partOrder.map((partName, pIdx) => {
                const key = section.name + "::" + partName;
                const isComp = completedParts.has(key);
                const isAct = key === activeKey;
                let state = "locked";
                if (isComp) state = "completed";
                else if (isAct) state = "active";
                else {
                  let allPrev = true;
                  for (let i = 0; i < pIdx; i++) {
                    if (!completedParts.has(section.name + "::" + section.partOrder[i])) {
                      allPrev = false;
                      break;
                    }
                  }
                  if (allPrev && !foundActiveInSection) state = "active";
                }
                if (state === "active") foundActiveInSection = true;

                const curIdx = globalNodeIdx;
                globalNodeIdx++;

                const size = state === "active" ? 72 : 64;
                const colors = {
                  active: {
                    bg: theme.gradients.nodeActive,
                    border: theme.colors.goldBorder,
                    shadow: theme.shadows.goldActive,
                    text: "#5a3800",
                  },
                  completed: {
                    bg: theme.gradients.nodeActive,
                    border: theme.colors.goldBorderDim,
                    shadow: theme.shadows.goldDim,
                    text: "#fff",
                  },
                  locked: {
                    bg: theme.gradients.nodeLocked,
                    border: "#3a3a50",
                    shadow: theme.shadows.locked,
                    text: "#555",
                  },
                };
                const c = colors[state];
                const part = section.parts[partName];
                const label = partName.replace(/^Part \d+: /, "");

                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {/* Pulse ring for active */}
                    {state === "active" && (
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          top: -10,
                          width: size + 20,
                          height: size + 20,
                          borderRadius: "50%",
                          border: `3px solid ${theme.colors.gold}`,
                          animation: "pulse-ring 2s ease-out infinite",
                          pointerEvents: "none",
                        }}
                      />
                    )}

                    <button
                      className={`duo-node node-button ${state === "active" ? "duo-float active" : state}`}
                      onClick={() =>
                        state !== "locked" &&
                        onStartSession(part.cards, label, section.name)
                      }
                      disabled={state === "locked"}
                      aria-label={
                        state === "locked"
                          ? `${label} - locked`
                          : state === "completed"
                          ? `${label} - completed, ${part.cards.length} cards`
                          : `Start ${label} - ${part.cards.length} cards`
                      }
                      style={{
                        width: size,
                        height: size,
                        borderRadius: "50%",
                        background: c.bg,
                        border: `3px solid ${c.border}`,
                        boxShadow: c.shadow,
                        color: c.text,
                        cursor: state === "locked" ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: state === "locked" ? 0.5 : 1,
                        position: "relative",
                      }}
                    >
                      {state === "completed"
                        ? Icons.check
                        : state === "locked"
                        ? Icons.lock
                        : getNodeIcon(part, curIdx)}
                    </button>

                    {/* START badge */}
                    {state === "active" && (
                      <div
                        aria-hidden="true"
                        style={{
                          marginTop: 8,
                          padding: "4px 16px",
                          borderRadius: 10,
                          background: "#fff",
                          color: theme.colors.bgCardGradientStart,
                          fontSize: 12,
                          fontWeight: 900,
                          letterSpacing: 1.5,
                          textTransform: "uppercase",
                          boxShadow: theme.shadows.badge,
                          animation: "bounce-subtle 2s ease-in-out infinite",
                        }}
                      >
                        START
                      </div>
                    )}

                    {/* Label */}
                    {state !== "active" && (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          color:
                            state === "locked"
                              ? theme.colors.textFaint
                              : theme.colors.textMuted,
                          textAlign: "center",
                          maxWidth: 130,
                          lineHeight: 1.2,
                        }}
                      >
                        {label}
                      </div>
                    )}

                    {state !== "locked" && state !== "active" && (
                      <div
                        style={{
                          fontSize: 10,
                          color: theme.colors.textSubtle,
                          marginTop: 2,
                        }}
                      >
                        {part.cards.length} cards
                      </div>
                    )}

                    {/* Toggle completion */}
                    {state !== "locked" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(key);
                        }}
                        aria-label={
                          isComp
                            ? `Mark ${label} as incomplete`
                            : `Mark ${label} as complete`
                        }
                        aria-pressed={isComp}
                        style={{
                          position: "absolute",
                          top: -2,
                          right: -2,
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: isComp
                            ? theme.colors.green
                            : theme.colors.borderMedium,
                          border: `2px solid ${
                            isComp ? theme.colors.greenDark : "rgba(255,255,255,0.2)"
                          }`,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: "#fff",
                          zIndex: 10,
                        }}
                      >
                        {isComp ? "\u2713" : ""}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
