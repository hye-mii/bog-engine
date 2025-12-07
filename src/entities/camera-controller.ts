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

  private targetX: number = 0;
  private targetY: number = 0;

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
  public update(dt: number): void {}

  /**
   *
   */
  public pan(deltaX: number, deltaY: number) {
    const camera = this.camera;
    camera.position.x = camera.position.x + deltaX * camera.worldPerPixelX;
    camera.position.y = camera.position.y - deltaY * camera.worldPerPixelY;
  }

  /**
   *
   */
  public zoomTo(mouseX: number, mouseY: number, zoomDelta: number) {
    const camera = this.camera;

    // Calculate camera's world position before applying zoom
    const oldCameraPosition = this.camera.screenToWorld(mouseX, mouseY);

    // Apply zoom
    camera.zoom = clamp(camera.zoom * Math.pow(this.ZOOM_SPEED, zoomDelta), this.ZOOM_MIN, this.ZOOM_MAX);

    // Calculate camera's world position after zoom
    const newCameraPosition = this.camera.screenToWorld(mouseX, mouseY);

    // Offset camera so mouse cursor stays on the world grid
    camera.position.x += oldCameraPosition.x - newCameraPosition.x;
    camera.position.y += oldCameraPosition.y - newCameraPosition.y;
  }

  // private screenToWorldWithZoom(screenX: number, screenY: number, zoom: number): WeakVector2 {
  //   const cWidth = this.camera.width;
  //   const cHeight = this.camera.height;
  //   const vWidth = this.camera.viewportWidth;
  //   const vHeight = this.camera.viewportHeight;

  //   const worldPerPixelX = cWidth / (vWidth * zoom);
  //   const worldPerPixelY = cHeight / (vHeight * zoom);

  //   const vX = worldPerPixelX * (screenX - vWidth / 2);
  //   const vY = worldPerPixelY * (screenY - vHeight / 2);

  //   const worldX = this.targetX + vX;
  //   const worldY = this.targetY - vY;
  //   return { x: worldX, y: worldY };
  // }
}
