#!/bin/bash
cd /home/kavia/workspace/code-generation/memory-match-game-146987-146996/memory_match_game_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

