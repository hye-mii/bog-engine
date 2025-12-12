import type { EventManager } from "../core/event-manager";
import type { Camera } from "../entities/camera";
import type { EventID } from "../types/event-types";
import { View } from "./view";

export class Viewport {
  // Viewport size variables
  private _width: number;
  private _height: number;

  // Active views
  private readonly _views: View[] = [];

  // Event variables
  private readonly eventManager: EventManager;
  private resizeViewportEventID: EventID;
  private cameraPanEventID: EventID;
  private cameraZoomEventID: EventID;
  private onCameraCreatedEventID: EventID;

  constructor(eventManager: EventManager, width: number, height: number) {
    this.eventManager = eventManager;
    this._width = Math.max(width, 1);
    this._height = Math.max(height, 1);

    // Add event listeners
    this.resizeViewportEventID = this.eventManager.subscribe("viewport", "resizeViewport", this.resize);
    this.cameraPanEventID = this.eventManager.subscribe("viewport", "moveCamera", this.panCamera);
    this.cameraZoomEventID = this.eventManager.subscribe("viewport", "zoomCamera", this.zoomCamera);
    this.onCameraCreatedEventID = this.eventManager.subscribe("viewport", "onCameraCreated", this.addView);
  }

  /**
   *
   */
  public update(dt: number) {
    this._views.forEach((view) => view.updateView(dt));
  }

  /**
   *
   */
  public getActiveView(): View {
    const activeView = this._views[0];
    if (!activeView) {
      throw Error("No active view found.");
    }
    return activeView;
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

    // Update active view size
    const view = this._views[0];
    if (!view) {
      throw Error("No active view found.");
    }
    view.resize(this._width, this._height);
  };

  private panCamera = (deltaX: number, deltaY: number) => {
    const view = this._views[0];
    view?.pan(deltaX, deltaY);
  };

  private zoomCamera = (mouseX: number, mouseY: number, zoomDelta: number) => {
    const view = this._views[0];
    view?.zoomTo(mouseX, mouseY, zoomDelta);
  };

  private addView = (camera: Camera) => {
    const newView = new View(this._width, this._height, camera);
    this._views.push(newView);
  };
}
