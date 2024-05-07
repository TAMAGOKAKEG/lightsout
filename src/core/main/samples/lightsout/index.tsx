import { useEffect, useState } from "react";
import {
  StyledText,
  StyledButton,
  StyledImage,
} from "../../../unit/package/StyledUix/main";
import {
  HorizontalLayout,
  VerticalLayout,
  LayoutElement,
  Canvas,
} from "../../../unit/package/PrimitiveUix/main";
import { Cell, GameState, initBoardWithRandomLights, toggleCell } from "./game";
import {
  createColor,
  createSprite,
  createStyle,
  createUiUnlitMaterial,
} from "../../../lib/styledUnit";

// ... (Style creation code omitted for brevity)
const { StyledSpace, Color, Sprite, Material } = createStyle({
  Color: {
    background: createColor([0.2, 0.2, 0.2, 1]),
    backgroundRev: createColor([0.8, 0.8, 0.8, 1]),
  },
  Sprite: {
    kadomaru: createSprite({
      url: "resdb:///d8495d0372ef5bb0f9eec8ad864ebf7bf7f699e713176821e6ed0f7826b78091.png",
      rect: [1, 1, 1, 1],
      borders: [0.33333, 0.33333, 0.33333, 0.33333],
      scale: 0.1,
      filterMode: "Anisotropic",
      wrapModeU: "Mirror",
      wrapModeV: "Mirror",
    }),
  },
  Material: {
    background: createUiUnlitMaterial({}),
  },
});

const CellView = ({ cell, toggle }: { cell: Cell; toggle: () => unknown }) => {
  return (
    <LayoutElement minHeight={50} minWidth={50}>
      <StyledButton onClick={toggle}>
        <StyledImage
          defaultColor={cell.isLightOn ? [1, 1, 0, 1] : [0.4, 0.4, 0.4, 1]}
        />
      </StyledButton>
    </LayoutElement>
  );
};

export const Main = ({}) => {
  const LIGHT_COUNT = 8;
  const DEFAULT_BOARD_SIZE = 3;

  const width = DEFAULT_BOARD_SIZE;
  const height = DEFAULT_BOARD_SIZE;

  const [state, setState] = useState<GameState>({
    board: initBoardWithRandomLights(width, height, LIGHT_COUNT),
    isStarted: false, // Add the missing isStarted property
    isGameOver: false,
  });

  const toggleCellAndCheckGameOver = (x: number, y: number) => {
    const newBoard = toggleCell(state.board, x, y);
    const isGameOver = newBoard.cells.every((cell) => !cell.isLightOn);

    setState({
      board: newBoard,
      isStarted: true,
      isGameOver,
    });
  };

  return (
    <StyledSpace>
      <Canvas size={[1100, 1500]}>
        <StyledImage
          styledColor={Color.background}
          styledMaterial={Material.background}
          styledSprite={Sprite.kadomaru}
        />
        // ... (UI code omitted for brevity)
        <VerticalLayout spacing={5}>
          {Array.from({ length: height }, (_, i) => i).map((y) => (
            <HorizontalLayout key={y} spacing={5}>
              {Array.from({ length: width }, (_, i) => i).map((x) => (
                <CellView
                  key={x}
                  cell={state.board.cells[y * height + x]}
                  toggle={() => {
                    toggleCellAndCheckGameOver(x, y);
                  }}
                />
              ))}
            </HorizontalLayout>
          ))}
        </VerticalLayout>
      </Canvas>
    </StyledSpace>
  );
};
