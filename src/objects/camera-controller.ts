import { clamp, lerp } from "../utils/math";
import { Camera } from "./camera";
import { Vector2 } from "../utils/vector-2";
import { BogEngine } from "../core/bog-engine";
import { Vector3 } from "../utils/vector-3";
import type { Viewport } from "../core/viewport";

export class CameraController {
  private readonly viewport: Viewport;
  private readonly camera: Camera;

  // Defaults
  // private readonly PAN_SPEED = 0.009;
  private readonly ZOOM_SPEED = 1.0015;
  private readonly MIN_ZOOM = 0.2; // // 0.2
  private readonly MAX_ZOOM = 12.0; // // 12.0

  constructor(viewport: Viewport, camera: Camera) {
    this.viewport = viewport;
    this.camera = camera;
  }

  public update(dt: number) {}

  public moveCamera(deltaX: number, deltaY: number) {
    const worldPerPixelX = this.camera.width / this.viewport.width / this.camera.zoom;
    const worldPerPixelY = this.camera.height / this.viewport.height / this.camera.zoom;

    this.camera.transform.position.x += deltaX * worldPerPixelX;
    this.camera.transform.position.y += deltaY * worldPerPixelY;

    this.camera.updateMatrices();
  }

  public zoomCamera(mousePosition: Vector2, zoomDelta: number) {
    const oldWorldPosition = this.camera.screenToWorld(mousePosition.x, mousePosition.y);

    // Apply zoom
    const zoomFactor = Math.pow(this.ZOOM_SPEED, zoomDelta);
    this.camera.zoom = clamp(this.camera.zoom * zoomFactor, this.MIN_ZOOM, this.MAX_ZOOM);

    const newWorldPosition = this.camera.screenToWorld(mousePosition.x, mousePosition.y);
    const dx = oldWorldPosition.x - newWorldPosition.x;
    const dy = oldWorldPosition.y - newWorldPosition.y;
    this.camera.transform.position.x += dx;
    this.camera.transform.position.y += dy;

    // Recalculate matrices
    this.camera.updateMatrices();
  }
}
