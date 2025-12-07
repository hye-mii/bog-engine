import type { EventManager } from "../core/event-manager";
import { KeyboardDevice } from "./devices/keyboard-device";
import { MouseDevice } from "./devices/mouse-device";
import { Vector2 } from "../utils/vector-2";
import { DOMDevice } from "./devices/dom-device";

export class InputManager {
  // Event Manager
  private readonly eventManager: EventManager;

  // DOM dependencies
  public readonly viewportElement: HTMLDivElement;
  public readonly canvasElement: HTMLCanvasElement;

  // Input Devices
  private readonly DOMDevice: DOMDevice;
  private readonly mouseDevice: MouseDevice;
  private readonly keyboardDevice: KeyboardDevice;

  // Input States
  private prevMousePosition: Vector2 = new Vector2(0, 0);
  private mousePosition: Vector2 = new Vector2(0, 0);
  private mouseDelta: Vector2 = new Vector2(0, 0);

  constructor(eventManager: EventManager, viewportElement: HTMLDivElement, canvasElement: HTMLCanvasElement) {
    this.viewportElement = viewportElement;
    this.canvasElement = canvasElement;
    this.eventManager = eventManager;

    this.DOMDevice = new DOMDevice();
    this.mouseDevice = new MouseDevice();
    this.keyboardDevice = new KeyboardDevice();
  }

  /**
   * Initialize input devices
   */
  public init() {
    this.DOMDevice.init(this.canvasElement);
    this.mouseDevice.init();
    this.keyboardDevice.init();
  }

  /**
   *
   */
  public processInput(dt: number) {
    this.processDOMInput(dt);
    this.processMouseInput(dt);
  }

  /**
   * ~ temp: Move these DOM level manipulation code outa here
   */
  private processDOMInput(dt: number) {
    // ------------ Consume Raw Input (burp) ------------

    const { isCanvasHovered, wasCanvasResized } = this.DOMDevice.consumeDOMState();

    // ------------ Update Local Input ------------

    // ------------ Process Input -------------
    if (wasCanvasResized) {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.canvasElement.width = width;
      this.canvasElement.height = height;

      this.eventManager.fire("resizeViewport", width, height);
    }
  }

  /**
   *
   */
  private processMouseInput(dt: number) {
    // ------------ Consume Raw Input ------------

    const { wasDoubleClick, isPrimaryButtonDown, isSecondaryButtonDown, isAuxiliaryButtonDown, pointerX, pointerY, scrollDeltaY } =
      this.mouseDevice.consumeMouseState();

    // ------------ Update Local Input ------------

    const prevMousePosition = this.prevMousePosition;
    const mousePosition = this.mousePosition;
    const mouseDelta = this.mouseDelta;

    // Update previous mouse screen position
    prevMousePosition.x = mousePosition.x;
    prevMousePosition.y = mousePosition.y;

    // Calculate new mouse screen position
    const rect = this.canvasElement.getBoundingClientRect();
    mousePosition.x = Math.floor(pointerX - rect.left); // Offset by canvas' position
    mousePosition.y = Math.floor(pointerY - rect.top);

    // Calculate and update mouse delta
    mouseDelta.x = prevMousePosition.x - mousePosition.x;
    mouseDelta.y = prevMousePosition.y - mousePosition.y;

    // ------------ Process Input -------------

    // Pan active camera
    if (isAuxiliaryButtonDown && (mouseDelta.x !== 0 || mouseDelta.y !== 0)) {
      this.eventManager.fire("moveCamera", mouseDelta.x, mouseDelta.y);
    }

    // Zoom active camera
    if (scrollDeltaY !== 0) {
      this.eventManager.fire("zoomCamera", mousePosition.x, mousePosition.y, -scrollDeltaY);
    }
  }
}
