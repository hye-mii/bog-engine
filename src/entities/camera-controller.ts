import type { WeakVector2 } from "../types/basic-types";
import type { CameraControllerConfig } from "../types/entity-types";
import { clamp, lerp } from "../utils/math";
import type { Camera } from "./camera";
import { Entity } from "./entity";

export class CameraController extends Entity {
  public readonly camera: Camera;

  // Zoom variables
  private targetZoom: number = 1;
  private readonly ZOOM_SPEED: number;
  private readonly ZOOM_MIN: number;
  private readonly ZOOM_MAX: number;

  private mouseX: number = 0;
  private mouseY: number = 0;

  constructor(controllerConfig: CameraControllerConfig, activeCamera: Camera) {
    super("camera-controller");
    this.ZOOM_SPEED = controllerConfig.zoomSpeed;
    this.ZOOM_MIN = controllerConfig.zoomMin;
    this.ZOOM_MAX = controllerConfig.zoomMax;

    this.camera = activeCamera;
  }

  /**
   * Called each frame to update the entity.
   * @param dt Time elapsed since the last frame, in seconds.
   */
  public update(dt: number): void {
    const t = Math.min(dt * 16, 1);

    // Apply pan
    this.camera.position.x = lerp(this.camera.position.x, this.position.x, t);
    this.camera.position.y = lerp(this.camera.position.y, this.position.y, t);

    // Calculate camera's world position before applying zoom
    const oldCameraPosition1 = this.camera.screenToWorld(this.mouseX, this.mouseY);

    // Apply zoom
    this.camera.zoom = lerp(this.camera.zoom, this.targetZoom, t);

    // Calculate camera's world position after zoom
    const newCameraPosition1 = this.camera.screenToWorld(this.mouseX, this.mouseY);

    // Offset camera so mouse cursor stays on the world grid
    const offsetX = oldCameraPosition1.x - newCameraPosition1.x;
    const offsetY = oldCameraPosition1.y - newCameraPosition1.y;
    this.camera.position.x += offsetX;
    this.camera.position.y += offsetY;
    this.position.x += offsetX;
    this.position.y += offsetY;
  }

  /**
   *
   */
  public pan(deltaX: number, deltaY: number) {
    const camera = this.camera;
    this.position.x = this.position.x + deltaX * camera.worldPerPixelX;
    this.position.y = this.position.y - deltaY * camera.worldPerPixelY;
  }

  /**
   *
   */
  public zoomTo(mouseX: number, mouseY: number, zoomDelta: number) {
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    this.targetZoom = clamp(this.targetZoom * Math.pow(this.ZOOM_SPEED, zoomDelta), this.ZOOM_MIN, this.ZOOM_MAX);
  }

  private screenToWorldWithZoom(screenX: number, screenY: number, zoom: number): WeakVector2 {
    const cWidth = this.camera.width;
    const cHeight = this.camera.height;
    const vWidth = this.camera.viewportWidth;
    const vHeight = this.camera.viewportHeight;

    const worldPerPixelX = cWidth / (vWidth * zoom);
    const worldPerPixelY = cHeight / (vHeight * zoom);

    const vX = worldPerPixelX * (screenX - vWidth / 2);
    const vY = worldPerPixelY * (screenY - vHeight / 2);

    const worldX = this.position.x + vX;
    const worldY = this.position.y - vY;
    return { x: worldX, y: worldY };
  }
}
