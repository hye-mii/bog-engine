import type { Normalized } from "../types";
import type { Vector2 } from "../utils/vector-2";

export class Rect {
  public x: Normalized;
  public y: Normalized;
  public width: number;
  public height: number;

  constructor(x: Normalized, y: Normalized, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public get left() {
    return this.x;
  }
  public get top() {
    return this.y;
  }
  public get right() {
    return this.x + this.width;
  }
  public get bottom() {
    return this.y + this.height;
  }
}
