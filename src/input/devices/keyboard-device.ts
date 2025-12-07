import type { RawKeyboardState } from "../../types/input-types";

export class KeyboardDevice {
  private readonly keyboardState: RawKeyboardState = {
    // Keyboard keys
    keys: new Map(),

    // Keyboard Modifiers
    isControlKeyDown: false,
    isShiftKeyDown: false,
    isAltKeyDown: false,
  };

  /**
   * Binds global event listeners to the window object to capture all keyboard key input
   */
  public init(): void {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  /**
   * Consumes the current keyboard state, returns a read-only copy of the snapshot
   */
  public consumeKeyboardState(): RawKeyboardState {
    const keyMapCopy = new Map(this.keyboardState.keys);
    return { ...this.keyboardState, keys: keyMapCopy };
  }

  // ========================================================
  // -------------- Event Listener Functions ----------------
  // ========================================================

  private onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Control":
        this.keyboardState.isControlKeyDown = true;
        e.preventDefault();
        break;
      case "Shift":
        this.keyboardState.isShiftKeyDown = true;
        e.preventDefault();
        break;
      case "Alt":
        this.keyboardState.isAltKeyDown = true;
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Control":
        this.keyboardState.isControlKeyDown = false;
        e.preventDefault();
        break;
      case "Shift":
        this.keyboardState.isShiftKeyDown = false;
        e.preventDefault();
        break;
      case "Alt":
        this.keyboardState.isAltKeyDown = false;
        e.preventDefault();
        break;
      default:
        break;
    }
  };
}
