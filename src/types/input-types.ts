/** State related to the html dom (Canvas, Viewport). */
export interface DOMState {
  isCanvasHovered: boolean;
  wasCanvasResized: boolean;
}

/** State related to mouse buttons, posititon and scroll. */
export interface RawMouseState {
  // Mouse Buttons
  wasDoubleClick: boolean;
  isPrimaryButtonDown: boolean;
  isSecondaryButtonDown: boolean;
  isAuxiliaryButtonDown: boolean;

  // Mouse Position
  pointerX: number;
  pointerY: number;
  scrollDeltaY: number;
}

/** State related to all keyboard keys and modifiers. */
export interface RawKeyboardState {
  // Keyboard keys
  keys: Map<string, boolean>;

  // Keyboard Modifiers
  isControlKeyDown: boolean;
  isShiftKeyDown: boolean;
  isAltKeyDown: boolean;
}
