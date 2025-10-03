import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Types
 */
const EMOJIS = [
  "🐠",
  "🐚",
  "🐙",
  "🦀",
  "🐳",
  "🐬",
  "🪼",
  "🦈",
  "⚓",
  "🌊",
  "🧭",
  "🚢",
];

function makeDeck(size = 12) {
  // Pick first size unique items and create pairs
  const picks = EMOJIS.slice(0, size);
  const pairs = picks.flatMap((e, idx) => [
    { id: `${idx}-a`, key: idx, emoji: e },
    { id: `${idx}-b`, key: idx, emoji: e },
  ]);
  // Shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs;
}

/**
 * Utilities
 */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Card component
 */
function Card({ card, isFlipped, isMatched, onFlip, index }) {
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onFlip(card);
    }
  };

  return (
    <div
      className={[
        "card",
        isFlipped || isMatched ? "flipped" : "",
        isMatched ? "matched" : "",
      ].join(" ")}
      aria-live="polite"
    >
      <div className="card-inner">
        <div className="card-face card-front" aria-hidden={isFlipped || isMatched ? "true" : "false"}>
          <div className="front-pattern" />
          <div className="card-content">
            <div className="emoji" aria-hidden>🌊</div>
            <span className="emoji-tag">Flip</span>
          </div>
        </div>

        <div className="card-face card-back" aria-hidden={isFlipped || isMatched ? "false" : "true"}>
          <div className="card-content">
            <div className="emoji" role="img" aria-label={`card ${index + 1} value`}>
              {card.emoji}
            </div>
            <span className="emoji-tag">Match</span>
          </div>
        </div>
      </div>

      <button
        className="card-btn"
        onClick={() => onFlip(card)}
        onKeyDown={handleKey}
        aria-label={`Card ${index + 1}, ${isMatched ? "matched" : isFlipped ? "revealed" : "hidden"}`}
        disabled={isMatched}
      />
    </div>
  );
}

/**
 * Main MemoryGame component: manages state, logic, layout.
 */
// PUBLIC_INTERFACE
export default function MemoryGame() {
  /**
   * This is the main game component for the Memory Match game.
   * - Manages deck, selections, matches, moves, score, and timer
   * - Renders controls (score, moves, timer), grid of cards, restart button
   * - Provides win overlay and interactive feedback
   */

  const deckSize = 12; // number of unique pairs
  const [deck, setDeck] = useState(() =>
    makeDeck(deckSize)
  );
  const [flipped, setFlipped] = useState([]); // currently flipped (max 2) by id
  const [matchedKeys, setMatchedKeys] = useState(new Set()); // set of key indices matched
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0); // score = matchedPairs * 10 - small penalty for misses
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [lockBoard, setLockBoard] = useState(false);
  const [hintMsg, setHintMsg] = useState("");

  const totalPairs = useMemo(() => deckSize, [deckSize]);
  const matchedPairs = matchedKeys.size;
  const isWin = matchedPairs === totalPairs;

  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (running && !isWin) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
    return () => {};
  }, [running, isWin]);

  useEffect(() => {
    if (isWin) {
      setRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isWin]);

  // Start the game when mounted
  useEffect(() => {
    setRunning(true);
  }, []);

  const resetGame = useCallback(() => {
    setDeck(makeDeck(deckSize));
    setFlipped([]);
    setMatchedKeys(new Set());
    setMoves(0);
    setScore(0);
    setSeconds(0);
    setRunning(true);
    setLockBoard(false);
    setHintMsg("");
  }, [deckSize]);

  // Flip logic
  const handleFlip = useCallback(
    (card) => {
      if (lockBoard) return;
      if (flipped.some((id) => id === card.id)) return; // already flipped same card
      if (matchedKeys.has(card.key)) return; // already matched key

      const next = [...flipped, card.id];
      setFlipped(next);

      if (!running) setRunning(true);

      if (next.length === 2) {
        setLockBoard(true);
        setMoves((m) => m + 1);
        const [firstId, secondId] = next;
        const c1 = deck.find((c) => c.id === firstId);
        const c2 = deck.find((c) => c.id === secondId);
        if (c1 && c2 && c1.key === c2.key) {
          // match
          setTimeout(() => {
            setMatchedKeys((prev) => new Set(prev).add(c1.key));
            setScore((s) => s + 10);
            setFlipped([]);
            setLockBoard(false);
            setHintMsg("Nice! It's a match.");
            setTimeout(() => setHintMsg(""), 900);
          }, 450);
        } else {
          // no match
          setTimeout(() => {
            setScore((s) => Math.max(0, s - 2));
            setFlipped([]);
            setLockBoard(false);
            setHintMsg("Try again!");
            setTimeout(() => setHintMsg(""), 900);
          }, 800);
        }
      }
    },
    [deck, flipped, lockBoard, matchedKeys, running]
  );

  const gridCards = useMemo(
    () =>
      deck.map((card, idx) => {
        const isMatched = matchedKeys.has(card.key);
        const isFlipped = flipped.includes(card.id);
        return (
          <Card
            key={card.id}
            card={card}
            isFlipped={isFlipped}
            isMatched={isMatched}
            index={idx}
            onFlip={handleFlip}
          />
        );
      }),
    [deck, flipped, matchedKeys, handleFlip]
  );

  const efficiency =
    moves === 0 ? 0 : Math.round((matchedPairs / moves) * 100);

  return (
    <>
      <div className="game-shell" role="application" aria-label="Memory Match Game">
        <header className="game-header" aria-live="polite">
          <div className="brand">
            <div className="brand-badge" aria-hidden>
              🜲
            </div>
            <div>
              <h1>Memory Match</h1>
              <small>Ocean Professional</small>
            </div>
          </div>

          <div className="header-center">
            <div className="stats" aria-label="Game statistics">
              <div className="stat" title="Score">
                <div className="icon" aria-hidden>
                  ⭐
                </div>
                <div>
                  <div className="label">Score</div>
                  <div className="value" aria-live="polite">{score}</div>
                </div>
              </div>
              <div className="stat" title="Moves">
                <div className="icon" aria-hidden>
                  🎯
                </div>
                <div>
                  <div className="label">Moves</div>
                  <div className="value" aria-live="polite">{moves}</div>
                </div>
              </div>
              <div className="stat" title="Timer">
                <div className="icon" aria-hidden>
                  ⏱️
                </div>
                <div>
                  <div className="label">Time</div>
                  <div className="value" aria-live="polite">{formatTime(seconds)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="header-actions" />
        </header>

        <div className="grid-wrap">
          <div className="game-grid" aria-label="Cards grid">
            {gridCards}
          </div>
        </div>

        <div className="controls">
          <button className="btn" onClick={resetGame} aria-label="Restart game">
            <span aria-hidden>🔁</span>
            Restart
          </button>
          {hintMsg && <div className="toast" role="status">{hintMsg}</div>}
          <div className="hint">Match all pairs to win. Each match adds points, misses deduct a little.</div>
        </div>
      </div>

      {isWin && (
        <div className="win-overlay" role="dialog" aria-modal="true" aria-label="You won!">
          <div className="win-card">
            <div style={{ fontSize: "42px" }} aria-hidden>
              🏆
            </div>
            <h2 className="win-title">Great Job!</h2>
            <p className="win-sub">You matched all pairs.</p>

            <div className="inline-stats">
              <div className="pill">Score: {score}</div>
              <div className="pill">Moves: {moves}</div>
              <div className="pill">Time: {formatTime(seconds)}</div>
            </div>

            <div className="hint" aria-live="polite">
              Efficiency: {efficiency}% • Pairs: {matchedPairs}/{totalPairs}
            </div>

            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={resetGame} autoFocus>
                <span aria-hidden>🚀</span>
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {isWin ? "You won the game" : ""}
      </span>
    </>
  );
}
