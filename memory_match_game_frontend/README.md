# Memory Match - Ocean Professional

A modern, responsive memory match game built with React and styled using the "Ocean Professional" theme (blue and amber accents, minimalist design, rounded corners, subtle shadows and gradients).

## Features
- Solo play: flip cards to find matching pairs
- Game controls: Score, Moves, and Timer
- Responsive, centered grid
- Restart button and win overlay
- Smooth flip animations and subtle visual feedback
- Accessible with keyboard support (Enter/Space to flip)

## Scripts
- `npm start` - Start the development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Theme
- Primary: `#2563EB` (blue)
- Secondary/Success: `#F59E0B` (amber)
- Error: `#EF4444`
- Background: `#f9fafb`
- Surface: `#ffffff`
- Text: `#111827`

All theme tokens and styles live in `src/App.css`.

## Structure
- `src/components/MemoryGame.jsx` - Main game logic and UI
- `src/App.js` - App shell mounting the game
- `src/App.css` - Theme and component styles
- `src/index.js` - React entry point

## How to Play
- Click or press Enter/Space on a card to flip it
- Match pairs to score points
- Finish all pairs to win
- Click Restart to play again
