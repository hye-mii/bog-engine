import type { SettingsType, SpriteId, UInt } from "../types";
import { TweenScheduler } from "./tween-scheduler";
import { WebGPURenderer } from "./renderer";
import { InputManager } from "./input-manager";
import { UIManager } from "./ui-manager";
import { Viewport } from "./viewport";
import { Scene } from "./scene";
import { Sprite } from "../objects/sprite";
import { Vector2 } from "../utils/vector-2";

import { CameraTests } from "../../test/camera.test";

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
  private mouseDelta: Vector2 = new Vector2(0, 0);

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
    this.viewport = new Viewport(this.canvasElement.width, this.canvasElement.height, settings.camera);
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

    this.viewport.cameraController.update(dt);

    //
    // this.viewport.cameraController.update(dt);

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
    // --------- Retreive Raw Inputs ---------

    const rawClientX = this.input.rawClientX;
    const rawClientY = this.input.rawClientY;
    const rawScrollDeltaY = this.input.rawScrollDeltaY;
    this.input.rawScrollDeltaY = 0;
    const isAuxiliaryButtonDown = this.input.isAuxiliaryButtonDown;
    const isControlKeyDown = this.input.isControlKeyDown;
    const isShiftKeyDown = this.input.isShiftKeyDown;
    const isAltKeyDown = this.input.isAltKeyDown;
    const doubleClick = this.input.doubleClick;
    this.input.doubleClick = false;

    // --------- Calculate Input ---------
    const prevMousePosition = this.prevMousePosition;
    const mousePosition = this.mousePosition;
    const mouseDelta = this.mouseDelta;

    // Update previous mouse screen position
    prevMousePosition.x = mousePosition.x;
    prevMousePosition.y = mousePosition.y;

    // Calculate new mouse screen position
    const rect = this.canvasElement.getBoundingClientRect();
    mousePosition.x = Math.floor(rawClientX - rect.left); // Offset by canvas' position
    mousePosition.y = Math.floor(rawClientY - rect.top);

    // Calculate and update mouse delta (difference btw previous and current mouse position)
    mouseDelta.x = prevMousePosition.x - mousePosition.x;
    mouseDelta.y = prevMousePosition.y - mousePosition.y;

    // ! testing
    // console.log(`Raw Input: x:${mouseDelta.x} y:${mouseDelta.y} \n Mouse Coords: x:${mousePosition.x} y:${mousePosition.y}`);

    // --------- Process Input ---------

    // Handle camera pan and zoom
    const camera = this.viewport.camera;
    const controller = this.viewport.cameraController;
    if (isAuxiliaryButtonDown && (mouseDelta.x !== 0 || mouseDelta.y !== 0)) {
      controller.pan(mouseDelta.x, mouseDelta.y);
    }
    if (rawScrollDeltaY !== 0) {
      controller.zoom(mousePosition, -rawScrollDeltaY);
    }

    // Handle double click event
    if (doubleClick) {
      this.scene.onDoubleClick(mousePosition, camera, controller);
    }

    // ! testing
    // CameraTests.screenToWorld(
    //   camera,
    //   this.viewport.width,
    //   this.viewport.height,
    //   camera.width,
    //   camera.height,
    //   camera.position.x,
    //   camera.position.y,
    //   camera.zoom
    // );
  }
}
