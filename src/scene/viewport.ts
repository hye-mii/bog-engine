import type { EventManager } from "../core/event-manager";
import type { CameraController } from "../entities/camera-controller";
import type { EventID } from "../types/event-types";

export class Viewport {
  // Event manager variables
  private readonly eventManager: EventManager;
  private viewportResizeEventID: EventID | null = null;
  private controllerPanEventID: EventID | null = null;
  private controllerZoomEventID: EventID | null = null;

  // Active camera contoller
  private controller!: CameraController;

  // Viewport size variables
  private _width: number;
  public get width() {
    return this._width;
  }
  private _height: number;
  public get height() {
    return this._height;
  }

  private initialized: boolean = false;

  constructor(eventManager: EventManager, width: number, height: number) {
    this.eventManager = eventManager;
    this._width = Math.max(width, 1);
    this._height = Math.max(height, 1);
  }

  /**
   *
   */
  public init(controller: CameraController) {
    if (this.initialized) {
      throw Error("Viewport is already initialized!");
    }

    // Assign controller
    this.controller = controller;

    // Update camera's viewport size
    this.controller.camera.setViewportSize(this._width, this._height);

    // Add event listeners
    this.viewportResizeEventID = this.eventManager.subscribe("viewport", "resizeViewport", this.resize);
    this.controllerPanEventID = this.eventManager.subscribe("viewport", "moveCamera", this.moveCamera);
    this.controllerZoomEventID = this.eventManager.subscribe("viewport", "zoomCamera", this.zoomCamera);

    // Viewport is initialized
    this.initialized = true;
  }

  // ========================================================
  // -------------- Event Listener Functions ----------------
  // ========================================================

  /**
   * Resize the viewport used for camera projection matrices
   */
  private resize = (width: number, height: number) => {
    this._width = Math.max(width, 1);
    this._height = Math.max(height, 1);

    // Update camera's viewport size
    this.controller.camera.setViewportSize(width, height);
  };

  private moveCamera = (deltaX: number, deltaY: number) => {
    const controller = this.controller;
    controller.pan(deltaX, deltaY);
  };

  private zoomCamera = (mouseX: number, mouseY: number, zoomDelta: number) => {
    const controller = this.controller;
    controller.zoomTo(mouseX, mouseY, zoomDelta);
  };
}
