import type { UInt } from "../types";
import { Vector2 } from "../utils/vector-2";
import { Matrix4 } from "../utils/matrix-4";
import { Transform } from "./transform";
import { Viewport } from "../core/viewport";

export class Camera {
  private readonly viewport: Viewport;

  public readonly transform: Transform = new Transform();
  private _width: number;
  private _height: number;
  public zoom: number = 1.0;
  public projectionMatrix: Matrix4 = new Matrix4();
  public viewMatrix: Matrix4 = new Matrix4();
  public viewProjectionMatrix: Matrix4 = new Matrix4();
  public invViewProjectionMatrix: Matrix4 = new Matrix4();
  private baseWidth: UInt;

  constructor(viewport: Viewport, width: UInt, height: UInt) {
    this.viewport = viewport;
    this.baseWidth = width;
    this._width = width;
    this._height = height;
    this.updateMatrices();
  }
  public get width() {
    return this._width;
  }
  public get height() {
    return this._height;
  }

  public setSize(width: UInt, height: UInt) {
    this._width = width;
    this._height = height;

    // Update camera matrices
    this.updateMatrices();
  }

  public setAspect(aspect: number) {
    this._width = this.baseWidth;
    this._height = this.baseWidth / aspect;

    // Update camera matrices
    this.updateMatrices();
  }

  public screenToWorld(screenX: number, screenY: number): Vector2 {
    // Convert screen position to NDC position ( range -1 to 1 )
    const nx = (screenX / this.viewport.width) * 2 - 1;
    const ny = 1 - (screenY / this.viewport.height) * 2;

    // convert NDC to viewport coords
    const vx = (nx * (this._width / 2)) / this.zoom;
    const vy = (ny * (this._height / 2)) / this.zoom;

    // add camera position
    const worldX = this.transform.position.x + vx;
    const worldY = this.transform.position.y + vy;

    return new Vector2(worldX, worldY);
  }

  public updateMatrices() {
    // Update ortho matrix
    const halfWidth = this._width / this.zoom / 2;
    const halfHeight = this._height / this.zoom / 2;
    this.projectionMatrix.orthographic(-halfWidth, halfWidth, -halfHeight, halfHeight, -1, 1);

    // Apply Scale -> Rotate -> Translate
    this.viewMatrix.identity();
    this.viewMatrix.scale(this.transform.scale.x, this.transform.scale.y, this.transform.scale.z);

    // ~ 이 함수는 matrix4에 구현할 것
    //this.viewMatrix.fromQuaternion(this.transform.rotation);

    this.viewMatrix.translateXY(this.transform.position.x, this.transform.position.y);

    // View projection = projection * view
    this.viewProjectionMatrix.multiply2(this.projectionMatrix.data, this.viewMatrix.data);

    // Inverse view projection
    this.invViewProjectionMatrix.invert(this.viewProjectionMatrix.data);
  }
}
