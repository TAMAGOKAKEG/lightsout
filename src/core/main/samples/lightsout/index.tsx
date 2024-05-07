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
import {
  Cell,
  GameState,
  initBoardWithRandomLights,
  toggleCell,
  difficultyLevels,
  DifficultyLevel,
} from "./game";
import {
  createColor,
  createSprite,
  createStyle,
  createUiUnlitMaterial,
} from "../../../lib/styledUnit";

import { Box } from "../../../unit/package/Primitive/main";

const { StyledSpace, Color, Sprite, Material } = createStyle({
  Color: {
    background: createColor([0.2, 0.2, 0.2, 1]),
    backgroundRev: createColor([0.8, 0.8, 0.8, 1]),
    text: createColor([0.2, 0.2, 0.2, 1]),
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
const initBoard = (level: DifficultyLevel) => {
  const boardSize = difficultyLevels[level];
  const initLightsCount = Math.floor(Math.random() * boardSize * boardSize) + 1;

  const width = boardSize;
  const height = boardSize;

  return initBoardWithRandomLights(width, height, initLightsCount);
};
export const Main = ({}) => {
  // levelに応じたボードサイズを設定
  const DEFAULT_LEVEL = "Easy";
  const boardSize = difficultyLevels[DEFAULT_LEVEL];

  // boardSizeの二乗以下で1以上のランダムな数を返す

  const [state, setState] = useState<GameState>({
    board: initBoard("Easy"),
    isStarted: false, // Add the missing isStarted property
    isGameOver: false,
    level: "Easy",
  });

  const toggleCellAndCheckGameOver = (x: number, y: number) => {
    const newBoard = toggleCell(state.board, x, y);
    const isGameOver = newBoard.cells.every((cell) => !cell.isLightOn);

    console.log("isGameOver", isGameOver);

    setState({
      board: newBoard,
      isStarted: true,
      isGameOver,
      level: state.level,
    });
  };

  const restart = () => {
    console.log("restart");
    console.log("state.level", state.level);
    setState({
      board: initBoard(state.level),
      isStarted: true,
      isGameOver: false,
      level: state.level,
    });
  };

  const changeLevel = () => {
    // 現在のレベルから1つ上のレベルに変更
    // レベルがHardの場合はEasyに変更

    const currentLevel = state.level;
    const levels = Object.keys(difficultyLevels) as DifficultyLevel[];
    const currentLevelIndex = levels.indexOf(currentLevel);
    const nextLevelIndex = currentLevelIndex + 1;
    const nextLevel = levels[nextLevelIndex] || levels[0];

    setState({
      board: initBoard(nextLevel),
      isStarted: true,
      isGameOver: false,
      level: nextLevel,
    });
  };

  return (
    <Box size={[1.1, 1.5, 0.1]}>
      <StyledSpace>
        <Canvas size={[1100, 1500]} position={[0, 0, -0.055]}>
          <StyledImage
            styledColor={Color.background}
            styledMaterial={Material.background}
            styledSprite={Sprite.kadomaru}
          />
          <VerticalLayout
            paddingBottom={50}
            paddingLeft={50}
            paddingRight={50}
            paddingTop={50}
            forceExpandChildHeight={false}
            spacing={20}
          >
            <LayoutElement minHeight={100}>
              <StyledText
                content={"Lights Out" + " - " + state.level}
                styledColor={Color.backgroundRev}
                verticalAlign="Middle"
                horizontalAlign="Center"
              />
            </LayoutElement>
            <LayoutElement minHeight={1000}>
              <VerticalLayout spacing={5}>
                {Array.from({ length: state.board.width }, (_, i) => i).map(
                  (y) => (
                    <HorizontalLayout key={y} spacing={5}>
                      {Array.from(
                        { length: state.board.height },
                        (_, i) => i
                      ).map((x) => (
                        <CellView
                          key={x}
                          cell={state.board.cells[y * state.board.width + x]}
                          toggle={() => {
                            toggleCellAndCheckGameOver(x, y);
                          }}
                        />
                      ))}
                    </HorizontalLayout>
                  )
                )}
              </VerticalLayout>
            </LayoutElement>
            <LayoutElement minWidth={200} minHeight={100}>
              <StyledButton
                onClick={restart}
                defaultColor={[0.6, 0.6, 0.6, 1]}
                styledSprite={Sprite.kadomaru}
              >
                <StyledText
                  content="Restart"
                  styledColor={Color.text}
                  verticalAlign="Middle"
                  horizontalAlign="Center"
                  size={48}
                />
              </StyledButton>
            </LayoutElement>
            <LayoutElement minWidth={200} minHeight={100}>
              <StyledButton
                onClick={changeLevel}
                defaultColor={[0.6, 0.6, 0.6, 1]}
                styledSprite={Sprite.kadomaru}
              >
                <StyledText
                  content="Change Level"
                  styledColor={Color.text}
                  verticalAlign="Middle"
                  horizontalAlign="Center"
                  size={48}
                />
              </StyledButton>
            </LayoutElement>
          </VerticalLayout>
        </Canvas>
      </StyledSpace>
    </Box>
  );
};
