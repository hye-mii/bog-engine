import type { CameraConfig } from "../types/entity-types";
import { Matrix4 } from "../utils/matrix-4";
import { Entity } from "./entity";

export class Camera extends Entity {
  // Camera resolution variables
  public aspectRatio: number;
  private _width: number;
  private _zoom: number;

  // Camera matrices
  private isMatrixDirty: boolean = false;
  public readonly projectionMatrix: Matrix4 = new Matrix4();
  public readonly viewMatrix: Matrix4 = new Matrix4();
  public readonly viewProjectionMatrix: Matrix4 = new Matrix4();
  public readonly invViewProjectionMatrix: Matrix4 = new Matrix4();

  constructor(cameraConfig: CameraConfig) {
    super("Camera");
    this.aspectRatio = cameraConfig.width / cameraConfig.height;
    this._width = cameraConfig.width;
    this._zoom = Math.max(0.01, cameraConfig.zoom);
    this.position.set(cameraConfig.position.x, cameraConfig.position.y, 0);
  }
  public get width() {
    return this._width;
  }
  public get height() {
    return this._width / this.aspectRatio;
  }
  public get zoom() {
    return this._zoom;
  }
  public set zoom(v: number) {
    if (v <= 0) {
      console.error("Camera zoom must be positive number.");
      return;
    }
    this._zoom = v;

    // Set matrices dirty
    this.isMatrixDirty = true;
  }

  /**
   * Called each frame to update the entity.
   * @param dt Time elapsed since the last frame, in seconds.
   */
  public update(dt: number): void {
    if (this.transform.isDirty || this.isMatrixDirty) {
      this.transform.clearDirty();
      this.isMatrixDirty = false;

      // Update matrices
      this.updateMatrices();
    }
  }

  /**
   * Update camera's projection, view, view projection, and inverse view projection matrices.
   */
  private updateMatrices(): void {
    // Update ortho matrix
    const halfWidth = this._width / this._zoom / 2;
    const halfHeight = this.height / this._zoom / 2;
    this.projectionMatrix.orthographic(-halfWidth, halfWidth, -halfHeight, halfHeight, -1, 1);

    // Apply Scale -> Rotate -> Translate
    this.viewMatrix.identity();
    this.viewMatrix.translateXY(-this.position.x, -this.position.y);

    // ~ 이 함수는 matrix4에 구현할 것
    //this.viewMatrix.fromQuaternion(this.transform.rotation);

    this.viewMatrix.scale(this.scale.x, this.scale.y, this.scale.z);

    // View projection = projection * view
    this.viewProjectionMatrix.multiply2(this.projectionMatrix.data, this.viewMatrix.data);

    // Inverse view projection
    this.invViewProjectionMatrix.invert(this.viewProjectionMatrix.data);
  }
}
