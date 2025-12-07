import type { RawMouseState } from "../../types/input-types";

export class MouseDevice {
  private readonly mouseState: RawMouseState = {
    // Mouse Buttons
    wasDoubleClick: false,
    isPrimaryButtonDown: false,
    isSecondaryButtonDown: false,
    isAuxiliaryButtonDown: false,

    // Mouse Position
    pointerX: 0,
    pointerY: 0,
    scrollDeltaY: 0,
  };

  /**
   * Binds global event listeners to the window object to capture all mouse input
   */
  public init(): void {
    // Capture double click event
    window.addEventListener("dblclick", this.onMouseDoubleClick);

    // Capture mouse button state changes
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);

    // Capture mouse position
    window.addEventListener("mousemove", this.onMouseMove);

    // Capture mouse wheel scroll events
    window.addEventListener("wheel", this.onWheel, { passive: false });
  }

  /**
   * Consumes the current mouse state, returns a read-only copy of the snapshot
   */
  public consumeMouseState(): RawMouseState {
    const snapshot: RawMouseState = { ...this.mouseState };

    // Flush/reset consumable states
    this.mouseState.wasDoubleClick = false;
    this.mouseState.scrollDeltaY = 0;

    return snapshot;
  }

  // ========================================================
  // -------------- Event Listener Functions ----------------
  // ========================================================

  private onMouseDoubleClick = (e: MouseEvent) => {
    switch (e.button) {
      case 0:
        this.mouseState.wasDoubleClick = true;
        break;
      default:
        break;
    }
  };

  private onMouseDown = (e: MouseEvent) => {
    // Update pointer raw position
    this.mouseState.pointerX = e.clientX;
    this.mouseState.pointerY = e.clientY;

    // Capture pointer click
    switch (e.button) {
      case 0:
        this.mouseState.isPrimaryButtonDown = true;
        break;
      case 2:
        this.mouseState.isSecondaryButtonDown = true;
        break;
      case 1:
        this.mouseState.isAuxiliaryButtonDown = true;
        break;
      default:
        break;
    }
  };

  private onMouseUp = (e: MouseEvent) => {
    switch (e.button) {
      case 0:
        this.mouseState.isPrimaryButtonDown = false;
        break;
      case 2:
        this.mouseState.isSecondaryButtonDown = false;
        break;
      case 1:
        this.mouseState.isAuxiliaryButtonDown = false;
        break;
      default:
        break;
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    // Update pointer raw position
    this.mouseState.pointerX = e.clientX;
    this.mouseState.pointerY = e.clientY;

    // Update pointer button click during drag
    if (typeof e.buttons === "number") {
      this.mouseState.isPrimaryButtonDown = (e.buttons & 1) === 1;
      this.mouseState.isSecondaryButtonDown = (e.buttons & 2) === 2;
      this.mouseState.isAuxiliaryButtonDown = (e.buttons & 4) === 4;
    }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();

    // Update raw scroll delta
    this.mouseState.scrollDeltaY = e.deltaY;
  };
}
