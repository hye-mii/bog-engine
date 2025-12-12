import type { Camera } from "../entities/camera";
import type { WeakVector2 } from "../types/basic-types";
import { clamp, lerp } from "../utils/math";

export class View {
  private _width: number;
  private _height: number;
  private _worldPerPixelX: number;
  private _worldPerPixelY: number;

  // Camera variables
  public readonly camera: Camera;
  private targetX: number;
  private targetY: number;
  private targetZoom: number;
  private zoomX: number = 0;
  private zoomY: number = 0;

  // ~ temp: move these sumwhere else
  private readonly ZOOM_SPEED: number = 1.0015;
  private readonly ZOOM_MIN: number = 0.2;
  private readonly ZOOM_MAX: number = 12;

  constructor(width: number, height: number, camera: Camera) {
    this.camera = camera;
    this.targetX = camera.position.x;
    this.targetY = camera.position.y;
    this.targetZoom = camera.zoom;

    this._width = width;
    this._height = height;

    // Update camera's aspect ratio
    this.camera.aspectRatio = this._width / this._height;
    
    this._worldPerPixelX = this.camera.width / (this._width * this.targetZoom);
    this._worldPerPixelY = this.camera.height / (this._height * this.targetZoom);
  }
  public get width() {
    return this._width;
  }
  public get height() {
    return this._height;
  }
  public get worldPerPixelX() {
    return this._worldPerPixelX;
  }
  public get worldPerPixelY() {
    return this._worldPerPixelY;
  }

  /**
   * Called each frame to update the entity.
   * @param dt Time elapsed since the last frame, in seconds.
   */
  public updateView(dt: number) {
    const t = Math.min(dt * 16, 1);
    const camera = this.camera;

    // Apply camera pan
    camera.position.lerpXY({ x: this.targetX, y: this.targetY }, t);

    // Calculate camera's world position before applying zoom
    const oldCameraPosition = this.screenToWorldWithZoom(this.zoomX, this.zoomY, this.camera.zoom);

    // Apply zoom
    camera.zoom = lerp(camera.zoom, this.targetZoom, t);

    // Calculate camera's world position after zoom
    const newCameraPosition = this.screenToWorldWithZoom(this.zoomX, this.zoomY, this.camera.zoom);

    // Offset camera so mouse cursor stays on the world grid
    const offsetX = oldCameraPosition.x - newCameraPosition.x;
    const offsetY = oldCameraPosition.y - newCameraPosition.y;
    camera.position.x += offsetX;
    camera.position.y += offsetY;
    this.targetX += offsetX;
    this.targetY += offsetY;
  }

  /**
   * Pan camera
   */
  public pan(deltaX: number, deltaY: number) {
    this.targetX += deltaX * this._worldPerPixelX;
    this.targetY -= deltaY * this._worldPerPixelY;
  }

  /**
   * Zoom camera
   */
  public zoomTo(mouseX: number, mouseY: number, zoomDelta: number) {
    this.zoomX = mouseX;
    this.zoomY = mouseY;
    this.targetZoom = clamp(this.targetZoom * Math.pow(this.ZOOM_SPEED, zoomDelta), this.ZOOM_MIN, this.ZOOM_MAX);

    // Update world per pixel values
    this._worldPerPixelX = this.camera.width / (this._width * this.targetZoom);
    this._worldPerPixelY = this.camera.height / (this._height * this.targetZoom);
  }

  /**
   *
   */
  public resize(width: number, height: number) {
    this._width = Math.max(width, 1);
    this._height = Math.max(height, 1);

    // Update camera's aspect ratio
    this.camera.aspectRatio = this._width / this._height;

    // Update world per pixel values
    this._worldPerPixelX = this.camera.width / (this._width * this.targetZoom);
    this._worldPerPixelY = this.camera.height / (this._height * this.targetZoom);
  }

  /**
   * Calculate screen to world position
   */
  public screenToWorld(screenX: number, screenY: number): WeakVector2 {
    // Calculate world position relative to camera
    const vX = this._worldPerPixelX * (screenX - this._width / 2);
    const vY = this._worldPerPixelY * (screenY - this._height / 2);

    // Offset by camera to get the final world position
    const worldX = this.camera.position.x + vX;
    const worldY = this.camera.position.y - vY;

    return { x: worldX, y: worldY };
  }

  /**
   *
   */
  private screenToWorldWithZoom(screenX: number, screenY: number, zoom: number): WeakVector2 {
    const worldPerPixelX = this.camera.width / (this._width * zoom);
    const worldPerPixelY = this.camera.height / (this._height * zoom);

    const vX = worldPerPixelX * (screenX - this._width / 2);
    const vY = worldPerPixelY * (screenY - this._height / 2);

    const worldX = this.camera.position.x + vX;
    const worldY = this.camera.position.y - vY;
    return { x: worldX, y: worldY };
  }
}
