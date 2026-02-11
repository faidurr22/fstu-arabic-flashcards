import { useState, useMemo, useEffect, useCallback } from "react";
import DATA from "./data/flashcards.json";
import buildSectionTree from "./utils/buildSectionTree";
import FlashcardSession from "./components/FlashcardSession";
import GamifiedView from "./components/GamifiedView";
import StudyView from "./components/StudyView";
import ErrorBoundary from "./components/ErrorBoundary";
import theme from "./theme";
import "./styles/animations.css";

const SECTIONS = [...new Set(DATA.map((d) => d.section))];
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

export default function ArabicFlashcards() {
  const [view, setView] = useState("learn");
  const [session, setSession] = useState(null);
  const [completedParts, setCompletedParts] = useState(loadCompleted);

  useEffect(() => {
    saveCompleted(completedParts);
  }, [completedParts]);

  const markComplete = useCallback((key) => {
    setCompletedParts((prev) => {
      const n = new Set(prev);
      n.add(key);
      return n;
    });
  }, []);

  const toggleComplete = useCallback((key) => {
    setCompletedParts((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }, []);

  const sectionTree = useMemo(() => buildSectionTree(DATA), []);

  const handleSessionBack = (completed) => {
    if (completed && session?.partKey) {
      markComplete(session.partKey);
    }
    setSession(null);
  };

  if (session) {
    return (
      <ErrorBoundary>
        <FlashcardSession
          cards={session.cards}
          title={session.title}
          subtitle={session.subtitle}
          onBack={handleSessionBack}
          isLearnMode={!!session.partKey}
        />
      </ErrorBoundary>
    );
  }

  const tabs = [
    { key: "learn", label: "Learn", icon: "\uD83C\uDFAF" },
    { key: "study", label: "Study", icon: "\uD83D\uDCCB" },
  ];

  return (
    <ErrorBoundary>
      <div
        style={{
          fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
          background: theme.colors.bgDark,
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <header
          className="app-header"
          style={{
            padding: "16px 20px 0",
            background: theme.gradients.headerBg,
            borderBottom: `1px solid ${theme.colors.borderSubtle}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: theme.colors.text, letterSpacing: -0.5 }}>
                <span style={{ color: theme.colors.primary }}>FSTU</span> Arabic
              </h1>
              <p
                style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}
              >
                {DATA.length} flashcards
              </p>
            </div>
            <div
              style={{
                fontSize: 13,
                color: theme.colors.textDimmer,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 18 }} aria-hidden="true">
                &#128293;
              </span>{" "}
              {sectionTree.length} units
            </div>
          </div>

          {/* Tab nav */}
          <nav style={{ display: "flex", gap: 0 }} role="tablist" aria-label="Study mode">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                role="tab"
                aria-selected={view === tab.key}
                aria-controls={`${tab.key}-panel`}
                id={`${tab.key}-tab`}
                style={{
                  flex: 1,
                  padding: "10px 0 12px",
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                  borderBottom:
                    view === tab.key
                      ? `3px solid ${theme.colors.primary}`
                      : "3px solid transparent",
                  color: view === tab.key ? theme.colors.text : theme.colors.textDimmer,
                  fontSize: 14,
                  fontWeight: 800,
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span aria-hidden="true">{tab.icon}</span> {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {/* Tab panels */}
        <div
          id="learn-panel"
          role="tabpanel"
          aria-labelledby="learn-tab"
          hidden={view !== "learn"}
        >
          {view === "learn" && (
            <GamifiedView
              sectionTree={sectionTree}
              completedParts={completedParts}
              toggleComplete={toggleComplete}
              onStartSession={(cards, title, sub, partKey) =>
                setSession({ cards, title, subtitle: sub, partKey })
              }
            />
          )}
        </div>
        <div
          id="study-panel"
          role="tabpanel"
          aria-labelledby="study-tab"
          hidden={view !== "study"}
        >
          {view === "study" && <StudyView data={DATA} sections={SECTIONS} />}
        </div>
      </div>
    </ErrorBoundary>
  );
}
