import { clamp } from "../utils/math";

export class Rect {
  private _x: number;
  private _y: number;
  public width: number;
  public height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this._x = clamp(x, 0, 1);
    this._y = clamp(y, 0, 1);
    this.width = width;
    this.height = height;
  }

  public get x() {
    return this._x;
  }
  public get y() {
    return this._y;
  }

  public set x(v) {
    this._x = v;
  }
  public set y(v) {
    this._y = v;
  }
}
