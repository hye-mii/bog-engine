import type { Quaternion } from "./quaternion";
import type { Vector4 } from "./vector-4";

export class Matrix4 {
  public data: Float32Array;

  constructor() {
    this.data = new Float32Array(16);
    Matrix4.identity(this.data);
  }

  public static identity(out: Float32Array) {
    out.fill(0);
    out[0] = out[5] = out[10] = out[15] = 1;
  }

  public static orthographic(out: Float32Array, left: number, right: number, bottom: number, top: number, near: number, far: number) {
    const rl = right - left;
    const tb = top - bottom;
    const fn = far - near;

    out.fill(0);
    out[0] = 2 / rl;
    out[5] = 2 / tb;
    out[10] = -2 / fn;
    out[12] = -(right + left) / rl;
    out[13] = -(top + bottom) / tb;
    out[14] = -(far + near) / fn;
    out[15] = 1;
  }

  public static scaleFrom(out: Float32Array, source: Float32Array, sx: number, sy: number, sz: number) {
    // Scale X, Y, and Z basis vectors
    out[0] = source[0] * sx;
    out[1] = source[1] * sx;
    out[2] = source[2] * sx;
    out[3] = source[3] * sx;
    out[4] = source[4] * sy;
    out[5] = source[5] * sy;
    out[6] = source[6] * sy;
    out[7] = source[7] * sy;
    out[8] = source[8] * sz;
    out[9] = source[9] * sz;
    out[10] = source[10] * sz;
    out[11] = source[11] * sz;

    // Translation stays same
    out[12] = source[12];
    out[13] = source[13];
    out[14] = source[14];
    out[15] = source[15];
  }

  public static rotateXFrom(out: Float32Array, source: Float32Array, rad: number) {
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const y0 = source[4];
    const y1 = source[5];
    const y2 = source[6];
    const y3 = source[7];
    const z0 = source[8];
    const z1 = source[9];
    const z2 = source[10];
    const z3 = source[11];

    // Rotate Y and Z basis vectors
    out[4] = y0 * cos + z0 * sin;
    out[5] = y1 * cos + z1 * sin;
    out[6] = y2 * cos + z2 * sin;
    out[7] = y3 * cos + z3 * sin;

    out[8] = z0 * cos - y0 * sin;
    out[9] = z1 * cos - y1 * sin;
    out[10] = z2 * cos - y2 * sin;
    out[11] = z3 * cos - y3 * sin;

    // X basis and translation stays same
    out[0] = source[0];
    out[1] = source[1];
    out[2] = source[2];
    out[3] = source[3];

    out[12] = source[12];
    out[13] = source[13];
    out[14] = source[14];
    out[15] = source[15];
  }

  public static rotateYFrom(out: Float32Array, source: Float32Array, rad: number) {
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    let x0 = source[0];
    const x1 = source[1];
    const x2 = source[2];
    const x3 = source[3];
    const z0 = source[8];
    const z1 = source[9];
    const z2 = source[10];
    const z3 = source[11];

    // Rotate X and Z basis vectors
    out[0] = x0 * cos - z0 * sin;
    out[1] = x1 * cos - z1 * sin;
    out[2] = x2 * cos - z2 * sin;
    out[3] = x3 * cos - z3 * sin;

    out[8] = z0 * cos + x0 * sin;
    out[9] = z1 * cos + x1 * sin;
    out[10] = z2 * cos + x2 * sin;
    out[11] = z3 * cos + x3 * sin;

    // Y basis and translation stays same
    out[4] = source[4];
    out[5] = source[5];
    out[6] = source[6];
    out[7] = source[7];

    out[12] = source[12];
    out[13] = source[13];
    out[14] = source[14];
    out[15] = source[15];
  }

  public static rotateZFrom(out: Float32Array, source: Float32Array, rad: number) {
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const s0 = source[0];
    const s1 = source[1];
    const s2 = source[2];
    const s3 = source[3];
    const s4 = source[4];
    const s5 = source[5];
    const s6 = source[6];
    const s7 = source[7];

    // Rotate X and Y basis vectors
    out[0] = s0 * cos + s4 * sin;
    out[1] = s1 * cos + s5 * sin;
    out[2] = s2 * cos + s6 * sin;
    out[3] = s3 * cos + s7 * sin;

    out[4] = s4 * cos - s0 * sin;
    out[5] = s5 * cos - s1 * sin;
    out[6] = s6 * cos - s2 * sin;
    out[7] = s7 * cos - s3 * sin;

    // Z basis and translation stays same
    out[8] = source[8];
    out[9] = source[9];
    out[10] = source[10];
    out[11] = source[11];

    out[12] = source[12];
    out[13] = source[13];
    out[14] = source[14];
    out[15] = source[15];
  }

  public static rotateFrom(out: Float32Array, source: Float32Array, rx: number, ry: number, rz: number) {
    Matrix4.rotateZFrom(out, source, rz);
    Matrix4.rotateYFrom(out, source, ry);
    Matrix4.rotateXFrom(out, source, rx);
  }

  public static translateFrom(out: Float32Array, source: Float32Array, tx: number, ty: number, tz: number) {
    const x0 = source[0];
    const x1 = source[1];
    const x2 = source[2];
    const x3 = source[3];
    const y0 = source[4];
    const y1 = source[5];
    const y2 = source[6];
    const y3 = source[7];
    const z0 = source[8];
    const z1 = source[9];
    const z2 = source[10];
    const z3 = source[11];

    out[0] = x0;
    out[1] = x1;
    out[2] = x2;
    out[3] = x3;
    out[4] = y0;
    out[5] = y1;
    out[6] = y2;
    out[7] = y3;
    out[8] = z0;
    out[9] = z1;
    out[10] = z2;
    out[11] = z3;

    out[12] = x0 * tx + y0 * ty + z0 * tz + source[12];
    out[13] = x1 * tx + y1 * ty + z1 * tz + source[13];
    out[14] = x2 * tx + y2 * ty + z2 * tz + source[14];
    out[15] = x3 * tx + y3 * ty + z3 * tz + source[15];
  }

  public static translateXYFrom(out: Float32Array, source: Float32Array, tx: number, ty: number) {
    const x0 = source[0];
    const x1 = source[1];
    const x2 = source[2];
    const x3 = source[3];
    const y0 = source[4];
    const y1 = source[5];
    const y2 = source[6];
    const y3 = source[7];
    const z0 = source[8];
    const z1 = source[9];
    const z2 = source[10];
    const z3 = source[11];

    out[0] = x0;
    out[1] = x1;
    out[2] = x2;
    out[3] = x3;
    out[4] = y0;
    out[5] = y1;
    out[6] = y2;
    out[7] = y3;
    out[8] = z0;
    out[9] = z1;
    out[10] = z2;
    out[11] = z3;

    out[12] = x0 * tx + y0 * ty + source[12];
    out[13] = x1 * tx + y1 * ty + source[13];
    out[14] = x2 * tx + y2 * ty + source[14];
    out[15] = x3 * tx + y3 * ty + source[15];
  }

  public static translateYZFrom(out: Float32Array, source: Float32Array, ty: number, tz: number) {
    const x0 = source[0];
    const x1 = source[1];
    const x2 = source[2];
    const x3 = source[3];
    const y0 = source[4];
    const y1 = source[5];
    const y2 = source[6];
    const y3 = source[7];
    const z0 = source[8];
    const z1 = source[9];
    const z2 = source[10];
    const z3 = source[11];

    out[0] = x0;
    out[1] = x1;
    out[2] = x2;
    out[3] = x3;
    out[4] = y0;
    out[5] = y1;
    out[6] = y2;
    out[7] = y3;
    out[8] = z0;
    out[9] = z1;
    out[10] = z2;
    out[11] = z3;

    out[12] = y0 * ty + z0 * tz + source[12];
    out[13] = y1 * ty + z1 * tz + source[13];
    out[14] = y2 * ty + z2 * tz + source[14];
    out[15] = y3 * ty + z3 * tz + source[15];
  }

  public static translateZXFrom(out: Float32Array, source: Float32Array, tz: number, tx: number) {
    const x0 = source[0];
    const x1 = source[1];
    const x2 = source[2];
    const x3 = source[3];
    const y0 = source[4];
    const y1 = source[5];
    const y2 = source[6];
    const y3 = source[7];
    const z0 = source[8];
    const z1 = source[9];
    const z2 = source[10];
    const z3 = source[11];

    out[0] = x0;
    out[1] = x1;
    out[2] = x2;
    out[3] = x3;
    out[4] = y0;
    out[5] = y1;
    out[6] = y2;
    out[7] = y3;
    out[8] = z0;
    out[9] = z1;
    out[10] = z2;
    out[11] = z3;

    out[12] = x0 * tx + z0 * tz + source[12];
    out[13] = x1 * tx + z1 * tz + source[13];
    out[14] = x2 * tx + z2 * tz + source[14];
    out[15] = x3 * tx + z3 * tz + source[15];
  }

  public static transform(source: Vector4, matrix: Float32Array): Vector4 {
    const x = source.x;
    const y = source.y;
    const z = source.z;
    const w = source.w;
    source.x = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12] * w;
    source.y = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13] * w;
    source.z = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w;
    source.w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] * w;
    return source;
  }

  public identity() {
    this.data.fill(0);
    this.data[0] = this.data[5] = this.data[10] = this.data[15] = 1;
  }

  public orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number) {
    Matrix4.orthographic(this.data, left, right, bottom, top, near, far);
  }

  public scale(sx: number, sy: number, sz: number) {
    const d = this.data;
    d[0] *= sx;
    d[1] *= sx;
    d[2] *= sx;
    d[3] *= sx;

    d[4] *= sy;
    d[5] *= sy;
    d[6] *= sy;
    d[7] *= sy;

    d[8] *= sz;
    d[9] *= sz;
    d[10] *= sz;
    d[11] *= sz;
  }

  public scaleXY(sx: number, sy: number) {
    const d = this.data;
    d[0] *= sx;
    d[1] *= sx;
    d[2] *= sx;
    d[3] *= sx;

    d[4] *= sy;
    d[5] *= sy;
    d[6] *= sy;
    d[7] *= sy;
  }

  public scaleYZ(sy: number, sz: number) {
    const d = this.data;
    d[4] *= sy;
    d[5] *= sy;
    d[6] *= sy;
    d[7] *= sy;

    d[8] *= sz;
    d[9] *= sz;
    d[10] *= sz;
    d[11] *= sz;
  }

  public scaleZX(sz: number, sx: number) {
    const d = this.data;
    d[0] *= sx;
    d[1] *= sx;
    d[2] *= sx;
    d[3] *= sx;

    d[8] *= sz;
    d[9] *= sz;
    d[10] *= sz;
    d[11] *= sz;
  }

  public rotate(rx: number, ry: number, rz: number) {
    this.rotateZ(rz);
    this.rotateY(ry);
    this.rotateX(rx);
  }

  public rotateX(rad: number) {
    const d = this.data;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const y0 = d[4];
    const y1 = d[5];
    const y2 = d[6];
    const y3 = d[7];
    const z0 = d[8];
    const z1 = d[9];
    const z2 = d[10];
    const z3 = d[11];

    // Rotate Y and Z basis vectors
    d[4] = y0 * cos + z0 * sin;
    d[5] = y1 * cos + z1 * sin;
    d[6] = y2 * cos + z2 * sin;
    d[7] = y3 * cos + z3 * sin;

    d[8] = z0 * cos - y0 * sin;
    d[9] = z1 * cos - y1 * sin;
    d[10] = z2 * cos - y2 * sin;
    d[11] = z3 * cos - y3 * sin;
  }

  public rotateY(rad: number) {
    const d = this.data;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const x0 = d[0];
    const x1 = d[1];
    const x2 = d[2];
    const x3 = d[3];
    const z0 = d[8];
    const z1 = d[9];
    const z2 = d[10];
    const z3 = d[11];

    // Rotate X and Z basis vectors (hopefully doesn't cause any further issue)
    d[0] = x0 * cos - z0 * sin;
    d[1] = x1 * cos - z1 * sin;
    d[2] = x2 * cos - z2 * sin;
    d[3] = x3 * cos - z3 * sin;

    d[8] = z0 * cos + x0 * sin;
    d[9] = z1 * cos + x1 * sin;
    d[10] = z2 * cos + x2 * sin;
    d[11] = z3 * cos + x3 * sin;
  }

  public rotateZ(rad: number) {
    const d = this.data;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const x0 = d[0];
    const x1 = d[1];
    const x2 = d[2];
    const x3 = d[3];
    const y0 = d[4];
    const y1 = d[5];
    const y2 = d[6];
    const y3 = d[7];

    // Rotate X and Y basis vectors
    d[0] = x0 * cos + y0 * sin;
    d[1] = x1 * cos + y1 * sin;
    d[2] = x2 * cos + y2 * sin;
    d[3] = x3 * cos + y3 * sin;

    d[4] = y0 * cos - x0 * sin;
    d[5] = y1 * cos - x1 * sin;
    d[6] = y2 * cos - x2 * sin;
    d[7] = y3 * cos - x3 * sin;
  }

  public translate(tx: number, ty: number, tz: number) {
    const d = this.data;
    d[12] += d[0] * tx + d[4] * ty + d[8] * tz;
    d[13] += d[1] * tx + d[5] * ty + d[9] * tz;
    d[14] += d[2] * tx + d[6] * ty + d[10] * tz;
    d[15] += d[3] * tx + d[7] * ty + d[11] * tz;
  }

  public translateXY(tx: number, ty: number) {
    const d = this.data;
    d[12] += d[0] * tx + d[4] * ty;
    d[13] += d[1] * tx + d[5] * ty;
    d[14] += d[2] * tx + d[6] * ty;
    d[15] += d[3] * tx + d[7] * ty;
  }

  public translateYZ(ty: number, tz: number) {
    const d = this.data;
    d[12] += d[4] * ty + d[8] * tz;
    d[13] += d[5] * ty + d[9] * tz;
    d[14] += d[6] * ty + d[10] * tz;
    d[15] += d[7] * ty + d[11] * tz;
  }

  public translateZX(tz: number, tx: number) {
    const d = this.data;
    d[12] += d[0] * tx + d[8] * tz;
    d[13] += d[1] * tx + d[9] * tz;
    d[14] += d[2] * tx + d[10] * tz;
    d[15] += d[3] * tx + d[11] * tz;
  }

  public multiply2(a: Float32Array, b: Float32Array) {
    const aX0 = a[0];
    const aX1 = a[1];
    const aX2 = a[2];
    const aX3 = a[3];
    const aY0 = a[4];
    const aY1 = a[5];
    const aY2 = a[6];
    const aY3 = a[7];
    const aZ0 = a[8];
    const aZ1 = a[9];
    const aZ2 = a[10];
    const aZ3 = a[11];
    const aT0 = a[12];
    const aT1 = a[13];
    const aT2 = a[14];
    const aT3 = a[15];

    const bX0 = b[0];
    const bX1 = b[1];
    const bX2 = b[2];
    const bX3 = b[3];
    const bY0 = b[4];
    const bY1 = b[5];
    const bY2 = b[6];
    const bY3 = b[7];
    const bZ0 = b[8];
    const bZ1 = b[9];
    const bZ2 = b[10];
    const bZ3 = b[11];
    const bT0 = b[12];
    const bT1 = b[13];
    const bT2 = b[14];
    const bT3 = b[15];

    const c = this.data;
    const mul = (offset: number, b0: number, b1: number, b2: number, b3: number) => {
      c[0 + offset] = aX0 * b0 + aY0 * b1 + aZ0 * b2 + aT0 * b3;
      c[1 + offset] = aX1 * b0 + aY1 * b1 + aZ1 * b2 + aT1 * b3;
      c[2 + offset] = aX2 * b0 + aY2 * b1 + aZ2 * b2 + aT2 * b3;
      c[3 + offset] = aX3 * b0 + aY3 * b1 + aZ3 * b2 + aT3 * b3;
    };

    mul(0, bX0, bX1, bX2, bX3);
    mul(4, bY0, bY1, bY2, bY3);
    mul(8, bZ0, bZ1, bZ2, bZ3);
    mul(12, bT0, bT1, bT2, bT3);
  }

  public invert(a: Float32Array) {
    const d = this.data;

    const a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
    const a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
    const a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
    const a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;

    // determinant
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      // singular matrix
      return this;
    }
    det = 1.0 / det;

    d[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    d[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * det;
    d[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    d[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * det;
    d[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * det;
    d[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    d[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * det;
    d[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    d[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    d[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * det;
    d[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    d[11] = (-a20 * b04 + a21 * b02 - a22 * b00) * det;
    d[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * det;
    d[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    d[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * det;
    d[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return this;
  }

  public fromQuaternion(q: Quaternion) {
    const { x, y, z, w } = q;
    const d = this.data;

    const xx = x * x;
    const yy = y * y;
    const zz = z * z;

    const xy = x * y;
    const xz = x * z;
    const yz = y * z;
    const wx = w * x;
    const wy = w * y;
    const wz = w * z;

    d[0] = 1 - 2 * (yy + zz);
    d[1] = 2 * (xy + wz);
    d[2] = 2 * (xz - wy);
    d[3] = 0;

    d[4] = 2 * (xy - wz);
    d[5] = 1 - 2 * (xx + zz);
    d[6] = 2 * (yz + wx);
    d[7] = 0;

    d[8] = 2 * (xz + wy);
    d[9] = 2 * (yz - wx);
    d[10] = 1 - 2 * (xx + yy);
    d[11] = 0;

    d[12] = 0;
    d[13] = 0;
    d[14] = 0;
    d[15] = 1;
  }
}
