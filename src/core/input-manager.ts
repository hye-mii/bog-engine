import type { BogEngine } from "./bog-engine";

export class InputManager {
  private readonly engine: BogEngine;
  private readonly canvasElement: HTMLCanvasElement;

  // Event states
  private activePointerId: number | null = null;

  // Pointer states
  public rawClientX: number = 0;
  public rawClientY: number = 0;
  public rawScrollDeltaY: number = 0;
  public isPrimaryButtonDown: boolean = false;
  public isSecondaryButtonDown: boolean = false;
  public isAuxiliaryButtonDown: boolean = false;

  // Canvas states
  public isCanvasHovered: boolean = true;

  // Keyboard states
  public isControlKeyDown: boolean = false;
  public isShiftKeyDown: boolean = false;
  public isAltKeyDown: boolean = false;

  constructor(engine: BogEngine, canvasElement: HTMLCanvasElement, viewportElement: HTMLDivElement) {
    this.engine = engine;
    this.canvasElement = canvasElement;

    // Bind canvas event listeners
    this.bindCanvasListeners(canvasElement);

    // Bind viewport event listeners
    this.bindViewportListeners(viewportElement);

    // Bind global event listeners
    this.bindGlobalListeners();
  }

  private bindCanvasListeners(canvasElement: HTMLCanvasElement) {
    // Pointer focus and unfocus
    canvasElement.addEventListener("pointerenter", this.onCanvasPointerEnter);
    canvasElement.addEventListener("pointerleave", this.onCanvasPointerLeave);
    canvasElement.addEventListener("focus", this.onCanvasPointerEnter);
    canvasElement.addEventListener("blur", this.onCanvasPointerLeave);
  }

  private bindViewportListeners(viewportElement: HTMLDivElement) {
    // Pointer focus and unfocus
    viewportElement.addEventListener("pointerenter", this.onViewportPointerEnter);

    // Pointer buttons
    viewportElement.addEventListener("contextmenu", this.onViewportContextMenu);
    viewportElement.addEventListener("pointerdown", this.onViewportPointerDown);
    viewportElement.addEventListener("pointerup", this.onViewportPointerUp);
    viewportElement.addEventListener("pointermove", this.onViewportPointerMove);
    viewportElement.addEventListener("pointercancel", this.onViewportPointerUp);
    viewportElement.addEventListener("lostpointercapture", this.onViewportPointerUp);

    // Mouse scroll wheel
    viewportElement.addEventListener("wheel", this.onViewportWheel, { passive: false });
  }

  private bindGlobalListeners() {
    document.addEventListener("visibilitychange", this.onViewportVisibilityChange);
    window.addEventListener("pointerup", this.onWindowPointerUp);
    window.addEventListener("resize", this.onWindowResize);

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  // ========================================================
  // ----------------- Helper Functions ---------------------

  private tryReleaseCapture(element: HTMLElement, pointerId: number) {
    try {
      element.releasePointerCapture(pointerId);
    } catch {}
  }

  private trySetCapture(element: HTMLElement, pointerId: number) {
    try {
      element.setPointerCapture(pointerId);
    } catch {}
  }

  private resetInputState() {
    this.isPrimaryButtonDown = false;
    this.isSecondaryButtonDown = false;
    this.isAuxiliaryButtonDown = false;
  }

  // ========================================================
  // -------------- Event Listener Functions ----------------

  private onCanvasPointerEnter = () => {
    this.isCanvasHovered = true;
  };

  private onCanvasPointerLeave = () => {
    this.isCanvasHovered = false;
  };

  private onViewportPointerDown = (e: PointerEvent) => {
    // Update pointer raw position
    this.rawClientX = e.clientX;
    this.rawClientY = e.clientY;

    // Capture pointer click
    switch (e.button) {
      case 0:
        this.isPrimaryButtonDown = true;
        break;
      case 2:
        this.isSecondaryButtonDown = true;
        break;
      case 1:
        this.isAuxiliaryButtonDown = true;
        break;

      default:
        break;
    }

    // Try to capture canvas pointer event to keep recieving inputs
    this.trySetCapture(this.canvasElement, e.pointerId);
    this.activePointerId = e.pointerId;
  };

  private onViewportPointerMove = (e: PointerEvent) => {
    // Update pointer raw position
    this.rawClientX = e.clientX;
    this.rawClientY = e.clientY;

    // Update pointer button click during drag
    if (typeof e.buttons === "number") {
      this.isPrimaryButtonDown = (e.buttons & 1) === 1;
      this.isSecondaryButtonDown = (e.buttons & 2) === 2;
      this.isAuxiliaryButtonDown = (e.buttons & 4) === 4;
    }
  };

  private onViewportPointerUp = (e: PointerEvent) => {
    // The same pointer has called this event, try to release captured pointer
    if (this.activePointerId === e.pointerId) {
      this.tryReleaseCapture(this.canvasElement, e.pointerId);
      this.activePointerId = null;
    }

    // Reset states
    this.resetInputState();
  };

  private onViewportPointerEnter = (e: PointerEvent) => {
    // Update pointer raw position
    this.rawClientX = e.clientX;
    this.rawClientY = e.clientY;
  };

  private onViewportWheel = (e: WheelEvent) => {
    e.preventDefault();

    // Update raw scroll delta
    this.rawScrollDeltaY = e.deltaY;
  };

  private onViewportVisibilityChange = () => {
    if (document.hidden) {
      this.resetInputState();
      this.activePointerId = null;
    }
  };

  private onWindowPointerUp = () => {
    this.resetInputState();
    this.activePointerId = null;
  };

  private onWindowResize = () => {
    this.engine.updateViewport();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Control") this.isControlKeyDown = true;
    if (e.key === "Shift") this.isShiftKeyDown = true;
    if (e.key === "Alt") this.isAltKeyDown = true;

    if (document.activeElement === this.canvasElement) {
      e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Control") this.isControlKeyDown = false;
    if (e.key === "Shift") this.isShiftKeyDown = false;
    if (e.key === "Alt") this.isAltKeyDown = false;

    if (document.activeElement === this.canvasElement) {
      e.preventDefault();
    }
  };

  private onViewportContextMenu = (e: PointerEvent) => {
    e.preventDefault();
  };
}
