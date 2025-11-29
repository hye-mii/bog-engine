import type { UInt8 } from "../types";
import { clamp } from "../utils/math";

export class Color {
  private _r: UInt8 = 0 as UInt8;
  private _g: UInt8 = 0 as UInt8;
  private _b: UInt8 = 0 as UInt8;
  private _a: UInt8 = 255 as UInt8;

  public get r(): UInt8 {
    return this._r;
  }
  public get g(): UInt8 {
    return this._g;
  }
  public get b(): UInt8 {
    return this._b;
  }
  public get a(): UInt8 {
    return this._a;
  }

  public set r(v: UInt8 | number) {
    this._r = clamp(v, 0, 255) as UInt8;
  }
  public set g(v: UInt8 | number) {
    this._g = clamp(v, 0, 255) as UInt8;
  }
  public set b(v: UInt8 | number) {
    this._b = clamp(v, 0, 255) as UInt8;
  }
  public set a(v: UInt8 | number) {
    this._a = clamp(v, 0, 255) as UInt8;
  }
}
