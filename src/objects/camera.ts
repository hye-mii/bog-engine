import type { CameraConfig, UInt, WeakVector2 } from "../types";
import { Vector2 } from "../utils/vector-2";
import { Matrix4 } from "../utils/matrix-4";
import { Transform } from "./transform";
import { Viewport } from "../core/viewport";

export class Camera {
  // Dependencies
  private readonly viewport: Viewport;

  // State
  private readonly transform: Transform = new Transform();
  private aspectRatio: number;
  private storedWidth: number;
  private zoomLevel: number;

  private _worldPerPixelX: number;
  private _worldPerPixelY: number;

  public isMatrixDirty: boolean;

  // Camera matrices
  public readonly projectionMatrix: Matrix4 = new Matrix4();
  public readonly viewMatrix: Matrix4 = new Matrix4();
  public readonly viewProjectionMatrix: Matrix4 = new Matrix4();
  public readonly invViewProjectionMatrix: Matrix4 = new Matrix4();

  constructor(viewport: Viewport, cameraConfig: CameraConfig) {
    this.viewport = viewport;

    // Apply settings
    this.transform.position.x = cameraConfig.position.x;
    this.transform.position.y = cameraConfig.position.y;
    this.aspectRatio = cameraConfig.width / cameraConfig.height;
    this.storedWidth = cameraConfig.width;
    this.zoomLevel = cameraConfig.zoom;

    // Update world per pixel values
    this._worldPerPixelX = this.storedWidth / viewport.width / this.zoomLevel;
    this._worldPerPixelY = this.height / viewport.height / this.zoomLevel;

    // Mark camera matrices dirty
    this.isMatrixDirty = true;
  }
  public get width() {
    return this.storedWidth;
  }
  public get height() {
    return this.storedWidth / this.aspectRatio;
  }
  public get position() {
    return this.transform.position;
  }
  public get zoom() {
    return this.zoomLevel;
  }
  public get worldPerPixelX() {
    return this._worldPerPixelX;
  }
  public get worldPerPixelY() {
    return this._worldPerPixelY;
  }

  /**
   * Set new zoom value
   */
  public setZoom(value: number): void {
    if (value <= 0) {
      console.error("Camera zoom must be positive number.");
      return;
    }
    this.zoomLevel = value;

    // Update world per pixel values
    this._worldPerPixelX = this.width / this.viewport.width / this.zoom;
    this._worldPerPixelY = this.height / this.viewport.height / this.zoom;

    // Set matrices dirty
    this.isMatrixDirty = true;
  }

  /**
   * Set new aspect ratio of the camera. Does not change it's actual width.
   */
  public setAspect(width: number, height: number): void {
    this.aspectRatio = width / height;

    // Update world per pixel values
    this._worldPerPixelX = this.width / this.viewport.width / this.zoom;
    this._worldPerPixelY = this.height / this.viewport.height / this.zoom;

    // Set matrices dirty
    this.isMatrixDirty = true;
  }

  /**
   *
   */
  public setPosition(newX: number, newY: number): void {
    this.transform.position.x = newX;
    this.transform.position.y = newY;
    this.isMatrixDirty = true;
  }

  /**
   * Calculate screen to world position
   */
  public screenToWorld(screenX: number, screenY: number): WeakVector2 {
    // Calculate world position relative to camera
    const vX = this.worldPerPixelX * (screenX - this.viewport.width / 2);
    const vY = this.worldPerPixelY * (screenY - this.viewport.height / 2);

    // Offset by camera to get the final world position
    const worldX = this.position.x + vX;
    const worldY = this.position.y - vY;

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
    this.isMatrixDirty = false;
  }
}
