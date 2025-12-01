import type { SettingsType, SpriteId, UInt } from "../types";
import { TweenScheduler } from "./tween-scheduler";
import { WebGPURenderer } from "./renderer";
import { InputManager } from "./input-manager";
import { UIManager } from "./ui-manager";
import { Viewport } from "./viewport";
import { Scene } from "./scene";
import { Sprite } from "../objects/sprite";
import { Vector2 } from "../utils/vector-2";

// Custom comments expressions used in the project
// ! notice
// ? question
// * sync
// ~ temporary
// > todo
// // Redacted

export class BogEngine {
  private readonly settings: SettingsType;
  public readonly viewportElement: HTMLDivElement;
  public readonly canvasElement: HTMLCanvasElement;

  // Core components
  public readonly tweenScheduler: TweenScheduler;
  public readonly renderer: WebGPURenderer;
  public readonly input: InputManager;
  public readonly ui: UIManager;
  public readonly viewport: Viewport;
  public readonly scene: Scene;

  // Internal states
  private brushSize: number = 1;
  private prevMousePosition: Vector2 = new Vector2(0, 0);
  private mousePosition: Vector2 = new Vector2(0, 0);
  private isPanning: boolean = false;
  private panMousePosition: Vector2 = new Vector2(0, 0);

  constructor(settings: SettingsType, viewportElement: HTMLDivElement) {
    // ------ Store initial configuration ------
    this.settings = settings;
    this.viewportElement = viewportElement;
    this.canvasElement = BogEngine.createCanvasElement();

    // Attach canvas to viewport
    this.viewportElement.appendChild(this.canvasElement);

    // ------ Instantiate Core Components ------
    this.tweenScheduler = new TweenScheduler();
    this.renderer = new WebGPURenderer();
    this.input = new InputManager(this.canvasElement, this.viewportElement);
    this.ui = new UIManager();
    this.viewport = new Viewport(this.canvasElement.width, this.canvasElement.height, settings.camera.size);
    this.scene = new Scene();
  }

  public async init() {
    // Initialise renderer
    await this.renderer.init(this.canvasElement);

    // Bind Event Listeners
    BogEngine.bindListeners(this);

    // Initialise input manager
    this.input.init();

    // Add a default scene
    this.scene.addSprite(16 as UInt, 16 as UInt, 0, 0);

    // Start main loop
    requestAnimationFrame(this.loop);
  }

  private static createCanvasElement() {
    const canvasElement = document.createElement("canvas");
    canvasElement.id = "main-canvas";
    canvasElement.classList.add("main-canvas");
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    return canvasElement;
  }

  private static bindListeners(engine: BogEngine) {
    // Setup logic to handle window resizing
    engine.input.addResizeListener(() => {
      // Get new canvas size from the window
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Update canvas element
      engine.canvasElement.width = width;
      engine.canvasElement.height = height;

      // Resize viewport
      engine.viewport.resize(width, height);
    });

    // Bind event listeners to inform renderer to create and remove GPU Sprites
    engine.scene.addSpriteAddedListener((sprite: Sprite) => {
      engine.renderer.createGPUSprite(sprite);
    });
    engine.scene.addSpriteRemovedListener((id: SpriteId) => {
      engine.renderer.destroyGPUSprite(id);
    });
  }

  private loop = () => {
    const dt = 0.016;

    //
    this.viewport.cameraController.update(dt);

    // Process input this frame
    this.processInput();

    // Render this frame
    if (this.scene) {
      this.renderer.render(this.viewport, this.scene);
    }

    // Continue the loop
    requestAnimationFrame(this.loop);
  };

  private processInput() {
    // Retreive raw inputs
    const rawClientX = this.input.rawClientX;
    const rawClientY = this.input.rawClientY;
    const rawScrollDeltaY = this.input.rawScrollDeltaY;
    this.input.rawScrollDeltaY = 0;

    const rect = this.canvasElement.getBoundingClientRect();
    const canvasRectWidth = rect.width;
    const canvasRectHeight = rect.height;
    const canvasRectLeft = rect.left;
    const canvasRectTop = rect.top;

    const isAuxiliaryButtonDown = this.input.isAuxiliaryButtonDown;
    const isControlKeyDown = this.input.isControlKeyDown;
    const isShiftKeyDown = this.input.isShiftKeyDown;
    const isAltKeyDown = this.input.isAltKeyDown;

    const doubleClick = this.input.doubleClick;
    this.input.doubleClick = false;

    const pixelX = rawClientX - canvasRectLeft;
    const pixelY = rawClientY - canvasRectTop;

    const scaleFactorX = this.canvasElement.width / canvasRectWidth;
    const scaleFactorY = this.canvasElement.height / canvasRectHeight;

    // Update mouse coordinates
    this.prevMousePosition.x = this.mousePosition.x;
    this.prevMousePosition.y = this.mousePosition.y;
    this.mousePosition.x = Math.floor(pixelX * scaleFactorX);
    this.mousePosition.y = Math.floor(pixelY * scaleFactorY);

    // Handle camera controls
    const controller = this.viewport.cameraController;

    // Zoom
    if (rawScrollDeltaY !== 0) {
      controller.zoomCamera(this.mousePosition, -rawScrollDeltaY);
    }

    // Pan
    if (isAuxiliaryButtonDown && (this.mousePosition.x !== this.prevMousePosition.x || this.mousePosition.y !== this.prevMousePosition.y)) {
      if (!this.isPanning) {
        this.isPanning = true;
        this.panMousePosition.x = this.mousePosition.x;
        this.panMousePosition.y = this.mousePosition.y;
      } else {
        // Calculate mouse delta
        const deltaX = this.panMousePosition.x - this.mousePosition.x;
        const deltaY = this.panMousePosition.y - this.mousePosition.y;

        // Apply pan
        controller.moveCamera(deltaX, -deltaY);

        // Update anchor for next frame
        this.panMousePosition.x = this.mousePosition.x;
        this.panMousePosition.y = this.mousePosition.y;
      }
    } else {
      this.isPanning = false;
    }

    // Double click
    if (doubleClick) {
      this.scene.onDoubleClick(this.mousePosition, this.viewport.camera, this.viewport.cameraController);
    }
  }
}
