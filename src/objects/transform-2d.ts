import { Vector2 } from "../utils/vector-2";

export class Transform2D {
  position: Vector2 = new Vector2(0, 0);
  rotation: number = 0; // in radians
  scale: Vector2 = new Vector2(1, 1);
  pivot: Vector2 = new Vector2(0.5, 0.5); // normalised

  constructor() {}
}
