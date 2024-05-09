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
import { Slot } from "../../../unit/package/Primitive/main";
import { Cylinder } from "../../../unit/package/Primitive/main";
import { useRef } from "react";
import { MatterPhysics, radiansToQuaternionZ } from "./physics";

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

const WORLD_SCALE = 0.01;
const BoxRenderer = (props: {
  position: [number, number, number];
  rotation: [number, number, number, number];
  size: [number, number, number];
}) => {
  return (
    <Box
      position={props.position}
      rotation={props.rotation}
      size={props.size}
    />
  );
};

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

  const [, _setTime] = useState(performance.now());
  const matterRef = useRef(new MatterPhysics());
  const timeRef = useRef(performance.now());

  const update = () => {
    _setTime(performance.now());
  };
  useEffect(() => {
    setInterval(() => {
      matterRef.current.update(1000 / 30);
      timeRef.current = performance.now();
      update();
    }, 1000 / 30);

    matterRef.current.addBox(1, -2, 10, 0.2, true);
    if (state.isGameOver) {
      // 5枚コインを落とす、間隔を開けて
      for (let i = 0; i < 7; i++) {
        setTimeout(() => {
          matterRef.current.addCoin(
            0,
            Math.random() * 3,
            0.5,
            0.1,
            false,
            Math.PI / 4
          );
        }, i * 100);
      }

      // restart
      restart();
      // すべてのコインをstaticにする
      matterRef.current.matterObjects.forEach((object) => {
        if (object.shape.type === "coin") {
          const finded = matterRef.current.engine.world.bodies.find(
            (composite) => composite.id === object.bodyId
          );
          if (finded) {
            finded.isStatic = true;
          }
        }
      });
      console.log(state);
    }

    // matterRef.current.addCoin(
    //   Math.random() * 3,
    //   Math.random() * 3,
    //   0.5,
    //   0.1,
    //   false,
    //   Math.PI / 4
    // );

    // matterRef.current.addCoin(
    //   Math.random() * 440,
    //   Math.random() * 3,
    //   1,
    //   1,
    //   false,
    //   Math.PI / 4
    // );
    // matterRef.current.addCoin(
    //   Math.random() * 3,
    //   Math.random() * 3,
    //   0.5,
    //   0.5,
    //   false,
    //   Math.PI / 4
    // );

    console.log(matterRef.current.engine.world);
  }, [state.isGameOver]);
  return (
    <Slot>
      {/* if game over , drop a coin */}
      {matterRef.current.matterObjects.map((object) => {
        const finded = matterRef.current.engine.world.bodies.find(
          (composite) => composite.id === object.bodyId
        );
        if (finded) {
          switch (object.shape.type) {
            case "box":
              return (
                <BoxRenderer
                  key={finded.id}
                  position={[
                    finded.position.x * WORLD_SCALE,
                    -finded.position.y * WORLD_SCALE,
                    0,
                  ]}
                  rotation={radiansToQuaternionZ(finded.angle)}
                  size={[object.shape.width, object.shape.height, 10]}
                />
                // <Cylinder
                //   key={finded.id}
                //   position={[
                //     finded.position.x * WORLD_SCALE,
                //     -finded.position.y * WORLD_SCALE,
                //     0,
                //   ]}
                //   rotation={radiansToQuaternionZ(finded.angle)}
                //   size={[0.5, 0.1, 0.5]}
                // />
              );
            case "coin":
              return (
                <Cylinder
                  key={finded.id}
                  position={[
                    finded.position.x * WORLD_SCALE,
                    -finded.position.y * WORLD_SCALE,
                    0,
                  ]}
                  rotation={radiansToQuaternionZ(finded.angle)}
                  size={[0.5, 0.1, 0.5]}
                />
              );
          }
        }
      })}

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
    </Slot>
  );
};
