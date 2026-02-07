# FSTU Arabic Flashcards

Interactive React flashcard app for learning Classical/Quranic Arabic with gamified learning paths, dual study modes, and 720+ cards across 10 units.

## Features

- **Gamified Learning Path** — Progress through units with a visual node-based pathway, completion tracking, and auto-unlock mechanics
- **Free Study Mode** — Filter by unit, part, and type (grammar/vocab) with card and table views
- **3D Flip Cards** — Smooth CSS 3D card flip animations showing English on front, Arabic on back
- **Keyboard Navigation** — Arrow keys to navigate, Space/Enter to flip, K to mark known
- **Progress Persistence** — Completed sections saved to localStorage across sessions
- **Mobile Responsive** — Adapts to phone and tablet screens
- **Accessible** — ARIA labels, roles, keyboard support, and screen reader semantics

## Project Structure

```
src/
├── App.jsx                        # Root component with tab navigation
├── data/flashcards.json           # 720 flashcard entries
├── components/
│   ├── ErrorBoundary.jsx          # React error boundary
│   ├── Flashcard.jsx              # 3D flip card
│   ├── FlashcardSession.jsx       # Guided study session
│   ├── GamifiedView.jsx           # Learning path with progress
│   ├── Icons.jsx                  # SVG icon library
│   ├── SectionBanner.jsx          # Unit header with progress bar
│   └── StudyView.jsx              # Free study with filters
├── styles/animations.css          # Keyframes and responsive breakpoints
├── utils/
│   ├── shuffle.js                 # Fisher-Yates shuffle
│   └── buildSectionTree.js        # Data tree builder
├── theme.js                       # Centralized colors and shared styles
└── __tests__/
    ├── shuffle.test.js            # Shuffle correctness tests
    ├── buildSectionTree.test.js   # Data structure tests
    └── filtering.test.js          # Card filtering tests
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run Tests

```bash
npm test
```

### Usage

Import the root component into your React app:

```jsx
import ArabicFlashcards from "./src/App";

function Root() {
  return <ArabicFlashcards />;
}
```

## Card Data

720 flashcards covering 10 units of Classical Arabic grammar and vocabulary. Each card has:

| Field | Description |
|-------|-------------|
| `section` | Unit 1–10 |
| `part` | Introduction, Part 1–4 |
| `type` | `grammar` or `vocab` |
| `arabic` | Fully diacritized Arabic text |
| `english` | English translation |

## Tech Stack

- React 18 (hooks)
- Pure CSS animations
- Jest for testing
- No external UI libraries

## License

MIT
