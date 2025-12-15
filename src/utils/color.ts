import { clamp } from "../utils/math";

export class Color {
  private _r: number;
  private _g: number;
  private _b: number;
  private _a: number;

  constructor(r: number, g: number, b: number, a: number = 255) {
    this._r = clamp(r, 0, 255);
    this._g = clamp(g, 0, 255);
    this._b = clamp(b, 0, 255);
    this._a = clamp(a, 0, 255);
  }

  public get r(): number {
    return this._r;
  }
  public get g(): number {
    return this._g;
  }
  public get b(): number {
    return this._b;
  }
  public get a(): number {
    return this._a;
  }

  public set r(v: number | number) {
    this._r = clamp(v, 0, 255);
  }
  public set g(v: number | number) {
    this._g = clamp(v, 0, 255);
  }
  public set b(v: number | number) {
    this._b = clamp(v, 0, 255);
  }
  public set a(v: number | number) {
    this._a = clamp(v, 0, 255);
  }
}
