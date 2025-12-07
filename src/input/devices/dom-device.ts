import type { DOMState } from "../../types/input-types";

export class DOMDevice {
  private readonly DOMState: DOMState = {
    isCanvasHovered: false,
    wasCanvasResized: false,
  };

  /**
   * Binds global event listeners to capture all dom related events
   */
  public init(canvasElement: HTMLCanvasElement): void {
    window.addEventListener("contextmenu", this.onContextMenu);
    window.addEventListener("resize", this.onWindowResize);

    canvasElement.addEventListener("pointerenter", this.onCanvasPointerEnter);
    canvasElement.addEventListener("pointerleave", this.onCanvasPointerLeave);
    canvasElement.addEventListener("focus", this.onCanvasPointerEnter);
    canvasElement.addEventListener("blur", this.onCanvasPointerLeave);
  }

  /**
   * Consumes the current dom state, returns a read-only copy of the snapshot
   */
  public consumeDOMState(): DOMState {
    const snapshot: DOMState = { ...this.DOMState };

    // Flush/reset consumable states
    this.DOMState.wasCanvasResized = false;

    return snapshot;
  }

  // ========================================================
  // -------------- Event Listener Functions ----------------
  // ========================================================

  private onContextMenu = (e: PointerEvent) => {
    e.preventDefault();
  };

  private onWindowResize = () => {
    this.DOMState.wasCanvasResized = true;
  };

  private onCanvasPointerEnter = () => {
    this.DOMState.isCanvasHovered = true;
  };

  private onCanvasPointerLeave = () => {
    this.DOMState.isCanvasHovered = false;
  };
}
