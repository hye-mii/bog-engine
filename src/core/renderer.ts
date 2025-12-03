import type { PixelDataRGBA, SpriteId } from "../types";
import type { Scene } from "./scene";
import type { Viewport } from "./viewport";
import type { Sprite } from "../objects/sprite";
import { GPUSprite } from "../objects/gpu-sprite";

// Import WGSL shaders
import backgroundShader from "../shaders/background-shader.wgsl?raw";
import spriteShader from "../shaders/sprite-shader.wgsl?raw";

export class WebGPURenderer {
  // Renderer states
  private initialised: boolean = false;
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private format!: GPUTextureFormat;

  // Global resources
  private quadVertexBuffer!: GPUBuffer;
  private globalUniformBuffer!: GPUBuffer;
  private globalBindGroupLayout!: GPUBindGroupLayout;
  private globalBindGroup!: GPUBindGroup;

  // Background resources
  private backgroundUniformBuffer!: GPUBuffer;
  private backgroundPipeline!: GPURenderPipeline;
  private backgroundBindGroupLayout!: GPUBindGroupLayout;
  private backgroundPipelineLayout!: GPUPipelineLayout;
  private backgroundBindGroup!: GPUBindGroup;

  // Sprite resources
  private gpuSprites: Map<string, GPUSprite> = new Map();
  private sharedSpritePipeline!: GPURenderPipeline;
  private sharedSpriteBindGroupLayout!: GPUBindGroupLayout;
  private sharedSpritePipelineLayout!: GPUPipelineLayout;
  private sharedSpriteBuffer!: GPUBuffer;

  /**
   * Renderer is initialized async via init()
   */
  constructor() {}

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

    // Create fullscreen quad buffer
    this.quadVertexBuffer = WebGPURenderer.setupQuadBuffer(this.device);

    // Setup global resources
    const { globalUniformBuffer, globalBindGroupLayout, globalBindGroup } = WebGPURenderer.createGlobalBuffer(this.device);
    this.globalUniformBuffer = globalUniformBuffer;
    this.globalBindGroupLayout = globalBindGroupLayout;
    this.globalBindGroup = globalBindGroup;

    // Setup background resources
    const { backgroundUniformBuffer, backgroundPipeline, backgroundBindGroupLayout, backgroundPipelineLayout, backgroundBindGroup } =
      WebGPURenderer.createBackgroundPassResources(this.device, this.format, this.globalBindGroupLayout);
    this.backgroundUniformBuffer = backgroundUniformBuffer;
    this.backgroundPipeline = backgroundPipeline;
    this.backgroundBindGroupLayout = backgroundBindGroupLayout;
    this.backgroundPipelineLayout = backgroundPipelineLayout;
    this.backgroundBindGroup = backgroundBindGroup;

    // Setup sprite resources
    const { sharedSpriteBindGroupLayout, sharedSpritePipelineLayout, sharedSpritePipeline, sharedSpriteBuffer } =
      WebGPURenderer.createSharedSpriteResources(this.device, this.format, this.globalBindGroupLayout);
    this.sharedSpriteBindGroupLayout = sharedSpriteBindGroupLayout;
    this.sharedSpritePipelineLayout = sharedSpritePipelineLayout;
    this.sharedSpritePipeline = sharedSpritePipeline;
    this.sharedSpriteBuffer = sharedSpriteBuffer;

    // The renderer is ready
    this.initialised = true;
  }

  /**
   * Create a GPU sprite for the given sprite object and add it to the renderer GPU sprite map
   */
  public createGPUSprite(sprite: Sprite) {
    if (this.gpuSprites.has(sprite.id)) {
      console.error("GPU sprite already exists for this sprite.");
      return;
    }

    const newGPUSprite = new GPUSprite(this.device, sprite, this.sharedSpriteBindGroupLayout);
    this.gpuSprites.set(sprite.id, newGPUSprite);
  }

  /**
   * Remove the GPU sprite with the given ID from the renderer's GPU sprite map
   */
  public destroyGPUSprite(id: SpriteId) {
    this.gpuSprites.delete(id);
  }

  /**
   * Render the given scene to the viewport
   */
  public render(viewport: Viewport, scene: Scene) {
    if (!this.initialised) {
      console.log("Renderer is not initialized!");
      return;
    }

    // Update global uniform buffer with viewport/camera data
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
    pass.setPipeline(this.backgroundPipeline);
    pass.setBindGroup(0, this.globalBindGroup);
    pass.setBindGroup(1, this.backgroundBindGroup);
    pass.setVertexBuffer(0, this.quadVertexBuffer);
    pass.draw(6);

    // Sprites pass
    pass.setPipeline(this.sharedSpritePipeline);
    pass.setBindGroup(0, this.globalBindGroup);
    pass.setVertexBuffer(0, this.sharedSpriteBuffer);

    for (const [key, sprite] of scene.sprites) {
      const gpuSprite = this.gpuSprites.get(sprite.id);
      if (!gpuSprite) {
        throw Error(`No GPU sprite found for sprite id:${sprite.id}`);
      }

      // Update GPU sprite uniform if dirty
      if (sprite.isDirty) {
        gpuSprite.updateUniform(this.device, sprite.modelMatrix.data);
        sprite.isDirty = false;
      }

      // Upload sprite texture to GPU
      this.uploadSpriteTexture(gpuSprite.texture, sprite.flattenedData, sprite.rect.width, sprite.rect.height);

      pass.setBindGroup(1, gpuSprite.bindGroup);
      pass.draw(6);
    }

    // Submit commands to GPU
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  /**
   * Upload pixel data to the GPU texture
   */
  private uploadSpriteTexture(texture: GPUTexture, pixelData: PixelDataRGBA, width: number, height: number) {
    this.device.queue.writeTexture(
      { texture: texture },
      pixelData as GPUAllowSharedBufferSource,
      {
        offset: 0,
        bytesPerRow: width * 4,
        rowsPerImage: height,
      },
      {
        width: width,
        height: height,
        depthOrArrayLayers: 1,
      }
    );
  }

  /**
   * Uploads global uniform buffer for the current viewport and camera
   */
  private uploadGlobalBuffer(viewport: Viewport) {
    const camera = viewport.camera;

    // Handle camera's matrix recalculation
    if (camera.isMatrixDirty) {
      camera.updateMatrices();
    }

    const cameraBufferSize = 144;
    const globalData = new Float32Array(cameraBufferSize / 4);

    // Camera view projection matrix
    globalData.set(camera.viewProjectionMatrix.data, 0);

    // Camera inverse view projection matrix
    globalData.set(camera.invViewProjectionMatrix.data, 16);

    // Screen size
    globalData[32] = viewport.width;
    globalData[33] = viewport.height;

    // World unit per pixel
    const WU = viewport.width / camera.width;
    globalData[34] = WU * camera.zoom;

    this.device.queue.writeBuffer(this.globalUniformBuffer, 0, globalData.buffer);
  }

  // ========================================================
  // -------------- Private Static Helpers ------------------

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

  /**
   * Create GPU resources for global uniforms
   */
  private static createGlobalBuffer(device: GPUDevice): {
    globalUniformBuffer: GPUBuffer;
    globalBindGroupLayout: GPUBindGroupLayout;
    globalBindGroup: GPUBindGroup;
  } {
    const cameraBufferSize = 144;
    const globalUniformBuffer = device.createBuffer({
      size: cameraBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const globalBindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: "uniform" },
        },
      ],
    });
    const globalBindGroup = device.createBindGroup({
      layout: globalBindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: globalUniformBuffer } }],
    });

    return {
      globalUniformBuffer,
      globalBindGroupLayout,
      globalBindGroup,
    };
  }

  /**
   * Create background pass GPU resources
   */
  private static createBackgroundPassResources(
    device: GPUDevice,
    format: GPUTextureFormat,
    globalBindGroupLayout: GPUBindGroupLayout
  ): {
    backgroundUniformBuffer: GPUBuffer;
    backgroundPipeline: GPURenderPipeline;
    backgroundBindGroupLayout: GPUBindGroupLayout;
    backgroundPipelineLayout: GPUPipelineLayout;
    backgroundBindGroup: GPUBindGroup;
  } {
    const backgroundBufferSize = 48;

    // Create a background buffer
    const backgroundUniformBuffer = device.createBuffer({
      size: backgroundBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Create shader module
    const backgroundShaderModule = device.createShaderModule({
      code: backgroundShader,
      label: "Background Shader Module",
    });

    // Create bind group layout
    const backgroundBindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
          buffer: { type: "uniform" },
        },
      ],
    });

    // Create pipeline and pipeline layout
    const backgroundPipelineLayout = device.createPipelineLayout({
      // Group 0: Global, Group 1: Background
      bindGroupLayouts: [globalBindGroupLayout, backgroundBindGroupLayout],
    });

    const backgroundPipeline = device.createRenderPipeline({
      layout: backgroundPipelineLayout,
      vertex: {
        module: backgroundShaderModule,
        entryPoint: "vs_main",
        buffers: [
          {
            arrayStride: 4 * 4,
            attributes: [
              {
                // pos
                shaderLocation: 0,
                offset: 0,
                format: "float32x2",
              },
              {
                // uv
                shaderLocation: 1,
                offset: 8,
                format: "float32x2",
              },
            ],
          },
        ],
      },
      fragment: {
        module: backgroundShaderModule,
        entryPoint: "fs_main",
        targets: [{ format: format }],
      },
      primitive: { topology: "triangle-list" },
    });

    // Create bind group
    const backgroundBindGroup = device.createBindGroup({
      layout: backgroundBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: backgroundUniformBuffer },
        },
      ],
    });

    // Initialise background buffer upload
    const backgroundData = new Float32Array(backgroundBufferSize / 4);

    // backgroundColor
    backgroundData[0] = 0;
    backgroundData[1] = 0;
    backgroundData[2] = 0;
    backgroundData[3] = 1;

    // lineColor
    backgroundData[4] = 0.12;
    backgroundData[5] = 0.12;
    backgroundData[6] = 0.12;
    backgroundData[7] = 1.0;

    // gridSize in world unit
    backgroundData[8] = 16.0;
    backgroundData[9] = 16.0;

    // lineThickness in pixels
    backgroundData[10] = 1;

    device.queue.writeBuffer(backgroundUniformBuffer, 0, backgroundData.buffer);

    return {
      backgroundUniformBuffer,
      backgroundPipeline,
      backgroundBindGroupLayout,
      backgroundPipelineLayout,
      backgroundBindGroup,
    };
  }

  /**
   * Create GPU resources for the sprite rendering pass
   */
  private static createSharedSpriteResources(
    device: GPUDevice,
    format: GPUTextureFormat,
    globalBindGroupLayout: GPUBindGroupLayout
  ): {
    sharedSpriteBindGroupLayout: GPUBindGroupLayout;
    sharedSpritePipelineLayout: GPUPipelineLayout;
    sharedSpritePipeline: GPURenderPipeline;
    sharedSpriteBuffer: GPUBuffer;
  } {
    const sharedSpriteBindGroupLayout = device.createBindGroupLayout({
      entries: [
        {
          // binding 0: uniform data
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
          buffer: { type: "uniform" },
        },
        {
          // binding 1: texture
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {},
        },
        {
          // binding 2: sampler
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {},
        },
      ],
    });

    const sharedSpritePipelineLayout = device.createPipelineLayout({
      // Group 0: Global, Group 1: Sprite
      bindGroupLayouts: [globalBindGroupLayout, sharedSpriteBindGroupLayout],
    });

    const spriteShaderModule = device.createShaderModule({ code: spriteShader, label: "Sprite Shader Module" });

    const sharedSpritePipeline = device.createRenderPipeline({
      layout: sharedSpritePipelineLayout,
      vertex: {
        module: spriteShaderModule,
        entryPoint: "vs_main",
        buffers: [
          {
            arrayStride: 4 * 4,
            attributes: [
              {
                // pos
                shaderLocation: 0,
                offset: 0,
                format: "float32x2",
              },
              {
                // uv
                shaderLocation: 1,
                offset: 2 * 4,
                format: "float32x2",
              },
            ],
          },
        ],
      },
      fragment: {
        module: spriteShaderModule,
        entryPoint: "fs_main",
        targets: [
          {
            format: format,
            blend: {
              color: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
                operation: "add",
              },
              alpha: {
                srcFactor: "one",
                dstFactor: "one-minus-src-alpha",
                operation: "add",
              },
            },
          },
        ],
      },
      primitive: { topology: "triangle-list" },
    });
    const spriteVertices = new Float32Array([0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0]);
    const sharedSpriteBuffer = device.createBuffer({
      size: spriteVertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(sharedSpriteBuffer, 0, spriteVertices);

    return {
      sharedSpriteBindGroupLayout,
      sharedSpritePipelineLayout,
      sharedSpritePipeline,
      sharedSpriteBuffer,
    };
  }
}
