"use client";

import { useState, useEffect } from "react";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const BOARD_SIZE = 3;

function addRandomTile(board: number[][]): number[][] {
  const empty: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newBoard = board.map(row => row.slice());
  newBoard[r][c] = value;
  return newBoard;
}

function compress(line: number[]): number[] {
  const filtered = line.filter(v => v !== 0);
  const result: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      result.push(filtered[i] * 2);
      i += 2;
    } else {
      result.push(filtered[i]);
      i += 1;
    }
  }
  while (result.length < BOARD_SIZE) result.push(0);
  return result;
}

function move(board: number[][], dir: "up" | "down" | "left" | "right"): number[][] {
  let newBoard = board.map(row => row.slice());
  const rotate = (b: number[][], times: number) => {
    let res = b;
    for (let t = 0; t < times; t++) {
      const tmp: number[][] = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          tmp[c][BOARD_SIZE - 1 - r] = res[r][c];
        }
      }
      res = tmp;
    }
    return res;
  };

  // Normalize to left move
  if (dir === "right") newBoard = rotate(newBoard, 2);
  else if (dir === "up") newBoard = rotate(newBoard, 1);
  else if (dir === "down") newBoard = rotate(newBoard, 3);

  for (let r = 0; r < BOARD_SIZE; r++) {
    newBoard[r] = compress(newBoard[r]);
  }

  // Rotate back
  if (dir === "right") newBoard = rotate(newBoard, 2);
  else if (dir === "up") newBoard = rotate(newBoard, 3);
  else if (dir === "down") newBoard = rotate(newBoard, 1);

  return newBoard;
}

function hasMoves(board: number[][]): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) return true;
      if (c + 1 < BOARD_SIZE && board[r][c] === board[r][c + 1]) return true;
      if (r + 1 < BOARD_SIZE && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

export default function Game2048() {
  const [board, setBoard] = useState<number[][]>(Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    let b = board;
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
  }, []);

  useEffect(() => {
    const newScore = board.flat().reduce((a, b) => a + b, 0);
    setScore(newScore);
    if (!hasMoves(board)) setGameOver(true);
  }, [board]);

  const handleMove = (dir: "up" | "down" | "left" | "right") => {
    const newBoard = move(board, dir);
    if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
      setBoard(addRandomTile(newBoard));
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-2">
        {board.flat().map((val, idx) => (
          <div key={idx} className="w-16 h-16 flex items-center justify-center bg-muted rounded">
            {val !== 0 && <span className="text-2xl font-bold">{val}</span>}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => handleMove("up")}>↑</button>
        <button onClick={() => handleMove("down")}>↓</button>
        <button onClick={() => handleMove("left")}>←</button>
        <button onClick={() => handleMove("right")}>→</button>
      </div>
      <div className="text-xl">Score: {score}</div>
      {gameOver && (
        <div className="mt-4">
          <Share text={`I scored ${score} in 2048! ${url}`} />
        </div>
      )}
    </div>
  );
}
