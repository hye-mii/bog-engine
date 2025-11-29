import type { BogEngine } from "./bog-engine";

export class UIManager {
  private readonly bogEngine: BogEngine;

  constructor(bogEngine: BogEngine, canvasElement: HTMLCanvasElement) {
    this.bogEngine = bogEngine;
  }
}
