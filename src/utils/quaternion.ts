export class Quaternion {
  private _x: number;
  private _y: number;
  private _z: number;
  private _w: number;
  private _isDirty: boolean = false;

  constructor(x: number, y: number, z: number, w: number) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
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

  public get w(): number {
    return this._w;
  }

  public set w(v: number) {
    this._w = v;
    this._isDirty = true;
  }

  public get isDirty(): boolean {
    return this._isDirty;
  }

  public clearDirty() {
    this._isDirty = false;
  }

  public static identity(): Quaternion {
    return new Quaternion(0, 0, 0, 1);
  }
}