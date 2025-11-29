import type { BlendMode, Color, UInt } from "../types";
import type { Sprite } from "./sprite";

export class Layer {
  public data: Uint8ClampedArray;
  public blendMode: BlendMode;

  constructor(width: UInt, height: UInt, blendMode: BlendMode = "normal") {
    this.data = new Uint8ClampedArray(width * height * 4);
    this.blendMode = blendMode;
  }

  public fill(color: Color) {
    for (let i = 0; i < this.data.length; i += 4) {
      this.data[i + 0] = color.r;
      this.data[i + 1] = color.g;
      this.data[i + 2] = color.b;
      this.data[i + 3] = color.a;
    }
  }
}
