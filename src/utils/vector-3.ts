export class Vector3 {
  public x: number;
  public y: number;
  public z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public static lerp(a: Vector3, b: Vector3, t: number, out: Vector3): Vector3 {
    out.x = a.x + (b.x - a.x) * t;
    out.y = a.y + (b.y - a.y) * t;
    out.z = a.z + (b.z - a.z) * t;
    return out;
  }

  public lerp(target: Vector3, t: number): this {
    this.x += (target.x - this.x) * t;
    this.y += (target.y - this.y) * t;
    this.z += (target.z - this.z) * t;
    return this;
  }
}
