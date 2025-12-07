import type { BrushShape } from "../types";

export class Brush {
  public size: number;
  public shape: BrushShape;
  public hardness: number;
  public opacity: number;
  public spacing: number;

  constructor(size: number, shape: BrushShape, hardness: number, opacity: number, spacing: number) {
    this.size = size;
    this.shape = shape;
    this.hardness = hardness;
    this.opacity = opacity;
    this.spacing = spacing;
  }
}
