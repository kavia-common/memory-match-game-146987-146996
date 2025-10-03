import React from "react";
import "./App.css";
import MemoryGame from "./components/MemoryGame";

/**
 * Root application shell rendering the MemoryGame.
 * Keeps the app minimal, delegates logic/UI to MemoryGame.
 */
// PUBLIC_INTERFACE
export default function App() {
  /** This is the root component bootstrapping the Memory Match game UI. */
  return (
    <div className="app-root">
      <MemoryGame />
    </div>
  );
}
