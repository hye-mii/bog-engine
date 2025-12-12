import type { WeakVector2, WeakVector3 } from "../types/basic-types";
import type { Vector2 } from "./vector-2";

export class Vector3 {
  private _x: number;
  private _y: number;
  private _z: number;
  private _isDirty: boolean = false;

  constructor(x: number, y: number, z: number) {
    this._x = x;
    this._y = y;
    this._z = z;
  }

  public get x(): number {
    return this._x;
  }

  public set x(v: number) {
    this._x = v;
    this._isDirty = true;
  }

  public get y(): number {
    return this._y;
  }

  public set y(v: number) {
    this._y = v;
    this._isDirty = true;
  }

  public get z(): number {
    return this._z;
  }

  public set z(v: number) {
    this._z = v;
    this._isDirty = true;
  }

  public get isDirty(): boolean {
    return this._isDirty;
  }

  public clearDirty() {
    this._isDirty = false;
  }

  public set(x: number, y: number, z: number): this {
    this._x = x;
    this._y = y;
    this._z = z;
    this._isDirty = true;
    return this;
  }

  // ========================================================
  // ------------------ Static Helpers ----------------------
  // ========================================================

  public static lerp(a: Vector3, b: Vector3, t: number, out: Vector3): Vector3 {
    out.x = a.x + (b.x - a.x) * t;
    out.y = a.y + (b.y - a.y) * t;
    out.z = a.z + (b.z - a.z) * t;
    return out;
  }

  public lerp(target: Vector3 | WeakVector3, t: number): this {
    this.x += (target.x - this.x) * t;
    this.y += (target.y - this.y) * t;
    this.z += (target.z - this.z) * t;
    return this;
  }

  public lerpXY(target: Vector2 | Vector3 | WeakVector2, t: number): this {
    this.x += (target.x - this.x) * t;
    this.y += (target.y - this.y) * t;
    return this;
  }
}
