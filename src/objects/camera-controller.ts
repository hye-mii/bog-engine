import { clamp, lerp } from "../utils/math";
import { Camera } from "./camera";
import { Vector2 } from "../utils/vector-2";
import type { Viewport } from "../core/viewport";
import type { CameraConfig, WeakVector2 } from "../types";

export class CameraController {
  private readonly viewport: Viewport;
  private readonly camera: Camera;

  // Defaults
  private readonly ZOOM_SPEED;
  private readonly MIN_ZOOM;
  private readonly MAX_ZOOM;

  // Camera Pan
  private isPanning = false;
  private targetWorld = { x: 0, y: 0 } as WeakVector2;
  private panElapsed = 0;

  // Camera Zoom
  private isZooming = false;
  private targetZoom = 1;
  private zoomElapsed = 0;

  constructor(viewport: Viewport, camera: Camera, cameraConfig: CameraConfig) {
    this.viewport = viewport;
    this.camera = camera;

    this.ZOOM_SPEED = cameraConfig.zoomSpeed;
    this.MIN_ZOOM = cameraConfig.minZoom;
    this.MAX_ZOOM = cameraConfig.maxZoom;
  }

  public update(dt: number): void {
    if (this.isZooming) {
      const camera = this.camera;
      const currentZoom = camera.zoom;

      //
      this.zoomElapsed += dt;
      const t = Math.min(this.zoomElapsed / 1, 1);

      camera.zoom = lerp(currentZoom, this.targetZoom, t);

      if (t === 1) {
        this.isZooming = false;
        this.zoomElapsed = 0;
      }
    }

    if (this.isPanning) {
      const camera = this.camera;

      //
      this.panElapsed += dt;
      const t = Math.min(this.panElapsed / 1, 1);

      camera.x = lerp(camera.x, this.targetWorld.x, t);
      camera.y = lerp(camera.y, this.targetWorld.y, t);

      if (t === 1) {
        this.isPanning = false;
        this.panElapsed = 0;
      }
    }
  }

  public pan(deltaX: number, deltaY: number) {
    // Stop camera move
    if (this.isPanning) {
      this.panElapsed = 0;
      this.isPanning = false;
    }

    const camera = this.camera;

    // Calculate new camera position
    camera.x = camera.x + deltaX * camera.worldPerPixelX;
    camera.y = camera.y - deltaY * camera.worldPerPixelY;
  }

  public zoom(mousePosition: Vector2, zoomDelta: number) {
    // Stop camera zoom
    if (this.isZooming) {
      this.zoomElapsed = 0;
      this.isZooming = false;
    }
    const camera = this.camera;

    // Calculate camera's world position before applying zoom
    const oldCameraPosition = this.camera.screenToWorld(mousePosition.x, mousePosition.y);

    // Apply zoom
    camera.zoom = clamp(camera.zoom * Math.pow(this.ZOOM_SPEED, zoomDelta), this.MIN_ZOOM, this.MAX_ZOOM);

    // Calculate camera's world position after zoom
    const newCameraPosition = this.camera.screenToWorld(mousePosition.x, mousePosition.y);

    // Offset camera so mouse cursor stays on the world grid
    camera.x += oldCameraPosition.x - newCameraPosition.x;
    camera.y += oldCameraPosition.y - newCameraPosition.y;
  }

  public moveTo(newCameraX: number, newCameraY: number) {
    this.targetWorld.x = newCameraX;
    this.targetWorld.y = newCameraY;
    this.isPanning = true;
    this.panElapsed = 0;
  }

  public zoomTo(newZoom: number) {
    this.targetZoom = newZoom;
    this.isZooming = true;
    this.zoomElapsed = 0;
  }
}
