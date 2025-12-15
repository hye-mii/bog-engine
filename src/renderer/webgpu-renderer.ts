import type { EventManager } from "../core/event-manager";
import type { Sprite } from "../entities/sprite";
import type { Scene } from "../scene/scene";
import type { Viewport } from "../scene/viewport";
import type { SpriteID } from "../types/entity-types";
import { createGlobalResources, type GlobalPassResources } from "./resources/global-pass-resources";
import { createBackgroundResources, type BackgroundPassResources } from "./resources/background-pass-resources";
import { createSpriteResources, type SpritePassResources } from "./resources/sprite-pass-resources";
import { GPUSprite } from "./resources/gpu-sprite";

// Import WGSL shaders
import backgroundShader from "./shaders/background-shader.wgsl?raw";
import spriteShader from "./shaders/sprite-shader.wgsl?raw";

export class WebGPURenderer {
  // Event varaibles
  private readonly _eventManager: EventManager;

  // Renderer states
  private initialised: boolean = false;
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private format!: GPUTextureFormat;

  // Global resources
  private quadVertexBuffer!: GPUBuffer;
  private globalResources!: GlobalPassResources;
  private globalUniformData = new Float32Array(144 / 4);

  // Background resources
  private backgroundResources!: BackgroundPassResources;

  // Sprite resources
  private sharedSpriteResources!: SpritePassResources;
  private gpuSprites: Map<string, GPUSprite> = new Map();

  /**
   * Setup events for on sprite add and remove
   * Renderer is initialized async via init()
   */
  constructor(eventManager: EventManager) {
    this._eventManager = eventManager;

    // Bind events
    this._eventManager.subscribe("webgpu-renderer", "onSpriteAdded", this.createGPUSprite);
    this._eventManager.subscribe("webgpu-renderer", "onSpriteDelete", this.destroyGPUSprite);
  }

  /**
   * Initialize the WebGPU renderer and all required resources
   *
   * Steps:
   * 1. Request GPU adapter and device
   * 2. Configure canvas context
   * 3. Create fullscreen quad buffer
   * 4. Setup resources for global, background, and sprite
   */
  public async init(canvasElement: HTMLCanvasElement) {
    // WebGPU not supported in this browser
    if (!navigator.gpu) {
      throw new Error("WebGPU is not supported in this browser.");
    }

    // WebGPU not supported in this browser
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("Failed to get a GPU adapter.");
    }

    // Request GPU adapter
    this.device = await adapter.requestDevice();
    this.context = canvasElement.getContext("webgpu")!;
    this.format = navigator.gpu.getPreferredCanvasFormat();

    // Configure context for rendering
    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: "premultiplied",
    });

    // Setup global resources
    this.quadVertexBuffer = WebGPURenderer.setupQuadBuffer(this.device);
    this.globalResources = createGlobalResources(this.device);

    // Setup background and sprite pass resources
    this.backgroundResources = createBackgroundResources(this.device, this.format, this.globalResources.bindGroupLayout, backgroundShader);
    this.sharedSpriteResources = createSpriteResources(this.device, this.format, this.globalResources.bindGroupLayout, spriteShader);

    // Ready to render
    this.initialised = true;
  }

  /**
   * Create a GPU sprite for the given sprite object and add it to the renderer GPU sprite map
   */
  public createGPUSprite = (sprite: Sprite) => {
    if (this.gpuSprites.has(sprite.id)) {
      console.error("GPU sprite already exists for this sprite.");
      return;
    }

    const newGPUSprite = new GPUSprite(this.device, sprite, this.sharedSpriteResources.bindGroupLayout);
    this.gpuSprites.set(sprite.id, newGPUSprite);
  };

  /**
   * Remove the GPU sprite with the given ID from the renderer's GPU sprite map
   */
  public destroyGPUSprite = (id: SpriteID) => {
    this.gpuSprites.delete(id);
  };

  /**
   * Render the scene
   */
  public render(viewport: Viewport, scene: Scene) {
    if (!this.initialised) {
      console.error("Renderer is not initialized!");
      return;
    }

    // Update global buffer with viewport/camera data
    this.uploadGlobalBuffer(viewport);

    // Acquire current swap chain texture and create encoder/pass
    const view = this.context.getCurrentTexture().createView();
    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view,
          clearValue: { r: 1, g: 0, b: 1, a: 1 }, // pink color for debugging
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    // Background pass
    pass.setPipeline(this.backgroundResources.pipeline);
    pass.setBindGroup(0, this.globalResources.bindGroup);
    pass.setBindGroup(1, this.backgroundResources.bindGroup);
    pass.setVertexBuffer(0, this.quadVertexBuffer);
    pass.draw(6);

    // Sprites pass
    pass.setPipeline(this.sharedSpriteResources.pipeline);
    pass.setBindGroup(0, this.globalResources.bindGroup);
    pass.setVertexBuffer(0, this.sharedSpriteResources.uniformBuffer);

    const sprites = scene.sprites;
    for (const sprite of sprites) {
      const gpuSprite = this.gpuSprites.get(sprite.id);
      if (!gpuSprite) {
        throw Error(`No GPU sprite found for sprite id:${sprite.id}`);
      }

      pass.setBindGroup(1, gpuSprite.bindGroup);
      pass.draw(6);
    }

    // Submit commands to GPU
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  /**
   * Uploads global uniform buffer for the current viewport and camera
   */
  private uploadGlobalBuffer(viewport: Viewport) {
    const view = viewport.getActiveView();
    const globalData = this.globalUniformData;

    // Camera view projection matrix
    globalData.set(view.camera.viewProjectionMatrix.data, 0);

    // Camera inverse view projection matrix
    globalData.set(view.camera.invViewProjectionMatrix.data, 16);

    // Screen size
    globalData[32] = view.width;
    globalData[33] = view.height;

    // World unit per pixel
    globalData[34] = view.worldPerPixelX;
    globalData[35] = view.worldPerPixelY;

    this.device.queue.writeBuffer(this.globalResources.uniformBuffer, 0, globalData.buffer);
  }

  // ========================================================
  // -------------- Private Static Helpers ------------------
  // ========================================================

  /**
   * Create full quad vertex buffer and upload its data to the GPU device
   */
  private static setupQuadBuffer(device: GPUDevice) {
    const quadVertices = new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, -1, 1, 0, 0, 1, -1, 1, 1, 1, 1, 1, 0]);
    const outBuffer = device.createBuffer({
      size: quadVertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(outBuffer, 0, quadVertices);
    return outBuffer;
  }
}
