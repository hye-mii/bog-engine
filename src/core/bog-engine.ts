import { EventManager } from "./event-manager";
import { InputManager } from "../input/input-manager";
import { SceneManager } from "../scene/scene-manager";
import { WebGPURenderer } from "../renderer/webgpu-renderer";
import { Viewport } from "../scene/viewport";

// Custom comments expressions used in the project
// ! notice
// ? question
// * sync
// ~ temporary
// > todo
// // Redacted

export class BogEngine {
  // DOM dependencies
  public readonly viewportElement: HTMLDivElement;
  public readonly canvasElement: HTMLCanvasElement;

  // Managers
  public readonly sceneManager: SceneManager;
  public readonly inputManager: InputManager;
  public readonly eventManager: EventManager;

  // Viewport and renderer
  public readonly viewport: Viewport;
  public readonly renderer: WebGPURenderer;

  // Main loop variables
  private lastTime: number = 0;

  constructor() {
    // Create viewport and canvas elements
    this.viewportElement = BogEngine.createViewportElement();
    this.canvasElement = BogEngine.createCanvasElement();

    // Attach canvas to viewport
    this.viewportElement.appendChild(this.canvasElement);

    // Instantiate Core Managers
    this.eventManager = new EventManager();
    this.sceneManager = new SceneManager(this.eventManager);
    this.inputManager = new InputManager(this.eventManager, this.viewportElement, this.canvasElement);

    // Instantiate Viewport and Renderer
    this.viewport = new Viewport(this.eventManager, this.canvasElement.width, this.canvasElement.height);
    this.renderer = new WebGPURenderer(this.eventManager);
  }

  /**
   * Initialize app
   */
  public async init() {
    // Initialise Renderer
    await this.renderer.init(this.canvasElement);

    // Initialise Input Manager
    this.inputManager.init();

    // Load a new scene
    this.sceneManager.loadScene();

    // Set viewport's active camera
    const activeController = this.sceneManager.getActiveCameraController();
    if (!activeController) {
      throw Error("No active camera controller found in the scene!");
    }
    this.viewport.init(activeController);

    // Start the main loop
    requestAnimationFrame(this.loop);
  }

  // ========================================================
  // ------------------ Main App Loop -----------------------
  // ========================================================

  /**
   * process-input -> update-event-manager -> update-scene -> render-scene
   */
  public loop = (time: DOMHighResTimeStamp) => {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // Process input this frame
    this.inputManager.processInput(dt);

    // Update event manager
    // this.eventManager.update(dt);

    // Update active scene
    this.sceneManager.updateScene(dt);

    // Render this scene
    const scene = this.sceneManager.getActiveScene();
    if (scene) {
      const activeCamera = scene.getActiveCamera();
      if (activeCamera) {
        this.renderer.render(this.viewport, scene, activeCamera);
      } else {
        console.error("No active camera to render!");
      }
    } else {
      if (!scene) console.error("No active scene to render!");
    }

    // Continue the loop
    requestAnimationFrame(this.loop);
  };

  // ========================================================
  // -------------- Private Static Helpers ------------------
  // ========================================================

  private static createViewportElement(): HTMLDivElement {
    const outViewport = document.createElement("div");
    outViewport.id = "viewport";
    document.body.appendChild(outViewport);
    return outViewport;
  }

  private static createCanvasElement(): HTMLCanvasElement {
    const outCanvas = document.createElement("canvas");
    outCanvas.id = "canvas";
    outCanvas.width = window.innerWidth;
    outCanvas.height = window.innerHeight;
    return outCanvas;
  }
}
