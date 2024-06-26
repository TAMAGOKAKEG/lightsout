import Matter, { Body } from "matter-js";

const WORLD_SCALE = 100;

export class MatterPhysics {
  engine = Matter.Engine.create();
  matterObjects: matterObject[] = [];

  addBox(
    x: number,
    y: number,
    width: number,
    height: number,
    isStatic?: boolean,
    angle: number = 0
  ) {
    const box = Matter.Bodies.rectangle(
      x * WORLD_SCALE,
      -y * WORLD_SCALE,
      width * WORLD_SCALE,
      height * WORLD_SCALE,
      {
        isStatic: isStatic,
        angle: angle,
      }
    );
    Matter.Composite.add(this.engine.world, box);

    this.matterObjects.push(
      new matterObject(box.id, { type: "box", width, height })
    );
  }
  addCoin(
    x: number,
    y: number,
    width: number,
    height: number,
    isStatic?: boolean,
    angle: number = 0
  ) {
    const box = Matter.Bodies.rectangle(
      x * WORLD_SCALE,
      -y * WORLD_SCALE,
      width * WORLD_SCALE,
      height * WORLD_SCALE,
      {
        isStatic: isStatic,
        angle: angle,
      }
    );
    Matter.Composite.add(this.engine.world, box);

    this.matterObjects.push(
      new matterObject(box.id, { type: "coin", width, height })
    );
  }

  addSphere(x: number, y: number, radius: number, isStatic?: boolean) {
    const sphere = Matter.Bodies.circle(
      x * WORLD_SCALE,
      -y * WORLD_SCALE,
      radius * WORLD_SCALE,
      { isStatic: isStatic, friction: 0.5 }
    );
    Matter.Composite.add(this.engine.world, sphere);
    this.matterObjects.push(
      new matterObject(sphere.id, { type: "circle", radius })
    );
  }

  addForce(bodyId: number, force: { x: number; y: number }) {
    const body = Matter.Composite.get(
      this.engine.world,
      bodyId,
      "body"
    ) as Body;
    Matter.Body.applyForce(body, body.position, force);
  }

  update(deltaTime: number) {
    Matter.Engine.update(this.engine, deltaTime);
  }
}

type Shape =
  | {
      type: "box";
      width: number;
      height: number;
    }
  | {
      type: "circle";
      radius: number;
    }
  | {
      type: "coin";
      width: number;
      height: number;
    };

class matterObject {
  bodyId: number;
  shape: Shape;

  constructor(bodyId: number, shape: Shape) {
    this.bodyId = bodyId;
    this.shape = shape;
  }
}

type Quaternion = {
  w: number;
  x: number;
  y: number;
  z: number;
};

export function radiansToQuaternionZ(
  radians: number
): [number, number, number, number] {
  return [Math.cos(radians / 2), -Math.sin(radians / 2), 0, 0];
}

// 使用例
const radians = Math.PI / 4; // 45度をラジアンに変換
const quaternion = radiansToQuaternionZ(radians);
console.log(quaternion);
