import { clamp, lerp } from "../utils/math";
import { Camera } from "./camera";
import { Vector2 } from "../utils/vector-2";
import type { Viewport } from "../core/viewport";
import type { CameraConfig } from "../types";

export class CameraController {
  private readonly viewport: Viewport;
  private readonly camera: Camera;

  // Defaults
  private readonly ZOOM_SPEED;
  private readonly MIN_ZOOM;
  private readonly MAX_ZOOM;

  // Camera Pan Variables
  private isPanning = false;
  private panStartPosition = new Vector2(0, 0);
  private cameraTargetLocation = new Vector2(0, 0);

  private mouseStartPosition = new Vector2(0, 0);
  private cameraStart = new Vector2(0, 0);

  //
  //
  private worldStart = { x: 0, y: 0 };

  constructor(viewport: Viewport, camera: Camera, cameraConfig: CameraConfig) {
    this.viewport = viewport;
    this.camera = camera;

    this.ZOOM_SPEED = cameraConfig.zoomSpeed;
    this.MIN_ZOOM = cameraConfig.minZoom;
    this.MAX_ZOOM = cameraConfig.maxZoom;
  }

  public pan(deltaX: number, deltaY: number) {
    const camera = this.camera;
    const oldPosition = camera.position;

    // Calculate new camera position
    const newX = oldPosition.x + deltaX * camera.worldPerPixelX;
    const newY = oldPosition.y - deltaY * camera.worldPerPixelY;
    camera.setPosition(newX, newY);
  }

  public zoom(mousePosition: Vector2, zoomDelta: number) {
    const camera = this.camera;

    // Calculate camera's world position before applying zoom
    const oldCameraPosition = this.camera.screenToWorld(mousePosition.x, mousePosition.y);

    // Apply zoom
    const newZoom = clamp(camera.zoom * Math.pow(this.ZOOM_SPEED, zoomDelta), this.MIN_ZOOM, this.MAX_ZOOM);
    camera.setZoom(newZoom);

    // Calculate camera's world position after zoom
    const newCameraPosition = this.camera.screenToWorld(mousePosition.x, mousePosition.y);

    // Offset camera so mouse cursor stays on the world grid
    const dx = oldCameraPosition.x - newCameraPosition.x;
    const dy = oldCameraPosition.y - newCameraPosition.y;
    camera.setPosition(camera.position.x + dx, camera.position.y + dy);
  }
}
