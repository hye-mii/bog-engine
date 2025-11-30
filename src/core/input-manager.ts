export class InputManager {
  // Dependencies
  private readonly canvasElement: HTMLCanvasElement;
  private readonly viewportElement: HTMLDivElement;

  // Event states
  private activePointerId: number | null = null;
  private onWindowResizeCallbaccs: (() => void)[] = [];

  // Canvas states
  public isCanvasHovered: boolean = true;

  // Pointer keys and states
  public isPrimaryButtonDown: boolean = false;
  public isSecondaryButtonDown: boolean = false;
  public isAuxiliaryButtonDown: boolean = false;
  public rawClientX: number = 0;
  public rawClientY: number = 0;
  public rawScrollDeltaY: number = 0;

  public doubleClick: boolean = false;

  // Keyboard keys and states
  public isControlKeyDown: boolean = false;
  public isShiftKeyDown: boolean = false;
  public isAltKeyDown: boolean = false;

  constructor(canvasElement: HTMLCanvasElement, viewportElement: HTMLDivElement) {
    this.canvasElement = canvasElement;
    this.viewportElement = viewportElement;
  }

  /**
   * Initializes the input manager and bind all relevant event listeners
   */
  public init() {
    // Bind canvas event listeners
    this.bindCanvasListeners(this.canvasElement);

    // Bind viewport event listeners
    this.bindViewportListeners(this.viewportElement);

    // Bind global event listeners
    this.bindGlobalListeners();
  }

  /**
   * Registers a function to be called whenever the browser window is resized
   */
  public addResizeListener(callback: () => void): void {
    this.onWindowResizeCallbaccs.push(callback);
  }

  /**
   * Removes a previously registered resize listener
   */
  public removeResizeListener(callback: () => void): void {
    const index = this.onWindowResizeCallbaccs.indexOf(callback);
    if (index > -1) {
      this.onWindowResizeCallbaccs.splice(index, 1);
    }
  }

  /**
   * Bind canvas event listeners
   */
  private bindCanvasListeners(canvasElement: HTMLCanvasElement) {
    // Pointer focus and unfocus
    canvasElement.addEventListener("pointerenter", this.onCanvasPointerEnter);
    canvasElement.addEventListener("pointerleave", this.onCanvasPointerLeave);
    canvasElement.addEventListener("focus", this.onCanvasPointerEnter);
    canvasElement.addEventListener("blur", this.onCanvasPointerLeave);
  }

  /**
   * Bind viewport event listeners (pointer/ mouse)
   */
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

    // Mouse double click
    viewportElement.addEventListener("dblclick", this.onViewportMouseDoubleClick);

    // Mouse scroll wheel
    viewportElement.addEventListener("wheel", this.onViewportWheel, { passive: false });
  }

  /**
   * Bind global window and document event listeners (keyboard)
   */
  private bindGlobalListeners() {
    document.addEventListener("visibilitychange", this.onViewportVisibilityChange);
    window.addEventListener("pointerup", this.onWindowPointerUp);
    window.addEventListener("resize", this.onWindowResize);

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  // ========================================================
  // ----------------- Helper Functions ---------------------

  /**
   * Some browsers throw if the pointer isn't captured by this element; safe to ignore
   */
  private trySetCapture(element: HTMLElement, pointerId: number) {
    try {
      element.setPointerCapture(pointerId);
    } catch {}
  }
  private tryReleaseCapture(element: HTMLElement, pointerId: number) {
    try {
      element.releasePointerCapture(pointerId);
    } catch {}
  }

  /**
   * Resets all tracked input state flags
   * Keep this in sync when adding new input mappings (!sync-inputs)
   */
  private resetAllInputState() {
    this.rawClientX = 0;
    this.rawClientY = 0;
    this.rawScrollDeltaY = 0;
    this.isCanvasHovered = false;

    this.resetPointerInputs();
    this.resetKeyboardInputs();
  }

  /**
   * Resets only pointer related button states
   */
  private resetPointerInputs() {
    this.isPrimaryButtonDown = false;
    this.isSecondaryButtonDown = false;
    this.isAuxiliaryButtonDown = false;
  }

  /**
   * Resets only keyboard button states
   */
  private resetKeyboardInputs() {
    this.isControlKeyDown = false;
    this.isShiftKeyDown = false;
    this.isAltKeyDown = false;
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

    // And reset pointer inputs
    this.resetPointerInputs();
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
      this.resetAllInputState();
      this.activePointerId = null;
    }
  };

  private onWindowPointerUp = () => {
    this.resetPointerInputs();
    this.activePointerId = null;
  };

  private onWindowResize = () => {
    this.onWindowResizeCallbaccs.forEach((fn) => fn());
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

  private onViewportMouseDoubleClick = (e: MouseEvent) => {
    switch (e.button) {
      case 0:
        this.doubleClick = true;
        break;
      default:
        break;
    }
  };
}
