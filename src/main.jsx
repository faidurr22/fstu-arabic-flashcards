import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ArabicFlashcards from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ArabicFlashcards />
  </StrictMode>
);
