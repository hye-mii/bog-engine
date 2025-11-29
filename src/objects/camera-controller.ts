import { clamp, lerp } from "../utils/math";
import { Camera } from "./camera";
import { Vector2 } from "../utils/vector-2";
import { BogEngine } from "../core/bog-engine";
import { Vector3 } from "../utils/vector-3";

export class CameraController {
  private readonly engine: BogEngine;
  public readonly camera: Camera;

  // Defaults
  private readonly MIN_ZOOM = 0.2;
  private readonly MAX_ZOOM = 12.0;
  private readonly ZOOM_SPEED = 1.0015;

  constructor(bogEngine: BogEngine, camera: Camera) {
    this.engine = bogEngine;
    this.camera = camera;
  }

  public update(dt: number) {}

  public moveCamera(deltaX: number, deltaY: number) {
    this.camera.transform.position.x += deltaX / this.camera.zoom;
    this.camera.transform.position.y -= deltaY / this.camera.zoom;
    this.camera.updateMatrices();
  }

  public zoomCamera(mousePosition: Vector2, zoomDelta: number) {
    const oldWorldPosition = this.camera.screenToWorld(mousePosition.x, mousePosition.y);

    const zoomFactor = Math.pow(this.ZOOM_SPEED, zoomDelta);
    this.camera.zoom = clamp(this.camera.zoom * zoomFactor, this.MIN_ZOOM, this.MAX_ZOOM);

    // Recalculate matrices
    this.camera.updateMatrices();

    const newWorldPosition = this.camera.screenToWorld(mousePosition.x, mousePosition.y);

    const dx = newWorldPosition.x - oldWorldPosition.x;
    const dy = newWorldPosition.y - oldWorldPosition.y;
    this.camera.transform.position.x += dx;
    this.camera.transform.position.y += dy;

    // Recalculate matrices
    this.camera.updateMatrices();
  }
}
