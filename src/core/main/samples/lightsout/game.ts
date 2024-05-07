import { assignArray } from "./util";

// Copilotくんがわかるようにコメントを追加しました。
// ゲームボードは通常、正方形のセルで構成されています。
// 各セルは、ON（明るい）またはOFF（暗い）の2つの状態のいずれかになります。
// ゲームが開始されると、ランダムに配置されたセルがONまたはOFFの状態で表示されます。
// プレイヤーの目標は、すべてのセルをOFF（暗い状態）にすることです。
// ゲームプレイ中にプレイヤーがセルをクリックすると、そのセルとその周囲のセルの状態が反転します（ONからOFF、OFFからONに切り替わります）。
// セルの周りには、上下左右のセルがあり、それらのセルも反転します。
// セルの状態をうまく切り替えて、すべてのセルをOFFにしましょう。

export interface Cell {
  readonly isLightOn: boolean;
}

export interface Board {
  readonly width: number;
  readonly height: number;
  readonly cells: ReadonlyArray<Cell>;
}

export interface GameState {
  readonly board: Board;
  readonly isStarted: boolean;
  readonly isGameOver: boolean;
}

// init
export function initBoard(width: number, height: number): Board {
  const cells = Array.from({ length: width * height }, () => ({
    isLightOn: false,
  }));
  return { width, height, cells };
}

// random
export function initBoardWithRandomLights(
  width: number,
  height: number,
  nLights: number
): Board {
  const cells = Array.from({ length: width * height }, () => ({
    isLightOn: false,
  }));

  for (let i = 0; i < nLights; i++) {
    const randomIndex = Math.floor(Math.random() * cells.length);
    const cell = cells[randomIndex];
    if (!cell.isLightOn) {
      cells[randomIndex] = { ...cell, isLightOn: true };
    } else {
      i--; // If the cell is already light on, retry the loop
    }
  }

  return { width, height, cells };
}

function indexToCoodinate(i: number, width: number): [number, number] {
  const x = i % width;
  const y = (i - x) / width;
  return [x, y];
}

function coordinateToIndex(x: number, y: number, width: number): number {
  return x + y * width;
}

export function getCellByCoordinate(board: Board, x: number, y: number): Cell {
  return board.cells[coordinateToIndex(x, y, board.width)];
}

function assignCell(
  board: Board,
  i: number,
  partialCell: Partial<Cell>
): Board {
  const cell = board.cells[i];
  return {
    ...board,
    cells: assignArray(board.cells, i, { ...cell, ...partialCell }),
  };
}

function isInsideBoard(
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

export function isLightsOnAll(board: Board): boolean {
  return board.cells.every((cell) => cell.isLightOn);
}

export function toggleCell(board: Board, x: number, y: number): Board {
  const directions = [
    [0, 0], // center
    [0, -1], // top
    [0, 1], // bottom
    [-1, 0], // left
    [1, 0], // right
  ];

  let newCells = [...board.cells];

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (isInsideBoard(nx, ny, board.width, board.height)) {
      const i = coordinateToIndex(nx, ny, board.width);
      const cell = newCells[i];
      newCells[i] = { ...cell, isLightOn: !cell.isLightOn };
    }
  }

  return { ...board, cells: newCells };
}

export function updateGameState(
  state: GameState,
  x: number,
  y: number
): GameState {
  const newBoard = toggleCell(state.board, x, y);
  const isGameOver = !isLightsOnAll(newBoard);
  return { ...state, board: newBoard, isGameOver };
}
