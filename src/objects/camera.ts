import type { CameraConfig, WeakVector2 } from "../types";
import { Matrix4 } from "../utils/matrix-4";
import { Transform } from "./transform";
import { Viewport } from "../core/viewport";

export class Camera {
  // Dependencies
  private readonly viewport: Viewport;

  // State
  private readonly transform = new Transform();
  public get x(): number {
    return this.transform.position.x;
  }
  public get y(): number {
    return this.transform.position.y;
  }
  public set x(v: number) {
    this.transform.position.x = v;
    this._isMatrixDirty = true;
  }
  public set y(v: number) {
    this.transform.position.y = v;
    this._isMatrixDirty = true;
  }
  private aspectRatio: number;
  private _width: number;
  public get width() {
    return this._width;
  }
  public get height() {
    return this._width / this.aspectRatio;
  }
  private _zoom: number;
  public get zoom() {
    return this._zoom;
  }
  public set zoom(v: number) {
    if (v <= 0) {
      console.error("Camera zoom must be positive number.");
      return;
    }
    this._zoom = v;

    // Update world per pixel values
    this.updateWorldPerPixel();

    // Set matrices dirty
    this._isMatrixDirty = true;
  }
  private _worldPerPixelX: number = 1;
  public get worldPerPixelX() {
    return this._worldPerPixelX;
  }
  private _worldPerPixelY: number = 1;
  public get worldPerPixelY() {
    return this._worldPerPixelY;
  }

  // Camera matrices
  public readonly projectionMatrix: Matrix4 = new Matrix4();
  public readonly viewMatrix: Matrix4 = new Matrix4();
  public readonly viewProjectionMatrix: Matrix4 = new Matrix4();
  public readonly invViewProjectionMatrix: Matrix4 = new Matrix4();

  // Dirty flags
  private _isMatrixDirty: boolean;
  public get isMatrixDirty() {
    return this._isMatrixDirty;
  }

  constructor(viewport: Viewport, cameraConfig: CameraConfig) {
    this.viewport = viewport;

    // Apply settings
    this.transform.position.x = cameraConfig.position.x;
    this.transform.position.y = cameraConfig.position.y;
    this.aspectRatio = cameraConfig.width / cameraConfig.height;
    this._width = cameraConfig.width;
    this._zoom = cameraConfig.zoom;

    // Update world per pixel values
    this.updateWorldPerPixel();

    // Mark camera matrices dirty
    this._isMatrixDirty = true;
  }

  private updateWorldPerPixel() {
    const viewport = this.viewport;
    // Formula: (cWidth / vWidth) * (1 / zoom)
    this._worldPerPixelX = this.width / (viewport.width * this.zoom);
    this._worldPerPixelY = this.height / (viewport.height * this.zoom);
  }

  /**
   * Set new aspect ratio of the camera. Does not change it's actual width.
   */
  public setAspect(width: number, height: number): void {
    this.aspectRatio = width / height;

    // Update world per pixel values
    this.updateWorldPerPixel();

    // Set matrices dirty
    this._isMatrixDirty = true;
  }

  /**
   * Calculate screen to world position
   */
  public screenToWorld(screenX: number, screenY: number): WeakVector2 {
    // Calculate world position relative to camera
    const vX = this.worldPerPixelX * (screenX - this.viewport.width / 2);
    const vY = this.worldPerPixelY * (screenY - this.viewport.height / 2);

    // Offset by camera to get the final world position
    const worldX = this.transform.position.x + vX;
    const worldY = this.transform.position.y - vY;

    return { x: worldX, y: worldY };
  }

  /**
   * Update camera's projection, view, view projection, and inverse view projection matrices.
   */
  public updateMatrices(): void {
    // Update ortho matrix
    const halfWidth = this.width / this.zoom / 2;
    const halfHeight = this.height / this.zoom / 2;
    this.projectionMatrix.orthographic(-halfWidth, halfWidth, -halfHeight, halfHeight, -1, 1);

    // Apply Scale -> Rotate -> Translate
    this.viewMatrix.identity();
    this.viewMatrix.translateXY(-this.transform.position.x, -this.transform.position.y);

    // ~ 이 함수는 matrix4에 구현할 것
    //this.viewMatrix.fromQuaternion(this.transform.rotation);

    this.viewMatrix.scale(this.transform.scale.x, this.transform.scale.y, this.transform.scale.z);

    // View projection = projection * view
    this.viewProjectionMatrix.multiply2(this.projectionMatrix.data, this.viewMatrix.data);

    // Inverse view projection
    this.invViewProjectionMatrix.invert(this.viewProjectionMatrix.data);

    // Matrices have been updated
    this._isMatrixDirty = false;
  }
}
