import type { SpriteId } from "../types";
import type { Scene } from "./scene";
import type { Viewport } from "./viewport";
import type { Sprite } from "../objects/sprite";
import { GPUSprite } from "../objects/gpu-sprite";

// Import WGSL shaders
import backgroundShader from "../shaders/background-shader.wgsl?raw";
import spriteShader from "../shaders/sprite-shader.wgsl?raw";

export class WebGPURenderer {
  private initialised: boolean = false;
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private format!: GPUTextureFormat;

  // Global resouces
  private quadVertexBuffer!: GPUBuffer;
  private globalUniformBuffer!: GPUBuffer;
  private globalBindGroupLayout!: GPUBindGroupLayout;
  private globalBindGroup!: GPUBindGroup;

  // Background resouces
  private backgroundUniformBuffer!: GPUBuffer;
  private backgroundPipeline!: GPURenderPipeline;
  private backgroundBindGroupLayout!: GPUBindGroupLayout;
  private backgroundPipelineLayout!: GPUPipelineLayout;
  private backgroundBindGroup!: GPUBindGroup;

  // Sprite resouces
  private gpuSprites: Map<string, GPUSprite> = new Map();
  private sharedSpritePipeline!: GPURenderPipeline;
  private sharedSpriteBindGroupLayout!: GPUBindGroupLayout;
  private sharedSpritePipelineLayout!: GPUPipelineLayout;

  public async init(canvasElement: HTMLCanvasElement) {
    if (!navigator.gpu) {
      throw new Error("WebGPU is not supported in this browser.");
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error("Failed to get a GPU adapter.");
    }

    this.device = await adapter.requestDevice();
    this.context = canvasElement.getContext("webgpu")!;
    this.format = navigator.gpu.getPreferredCanvasFormat();

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: "premultiplied",
    });

    // Create fullscreen quad buffer
    const quadVertices = new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, -1, 1, 0, 0, 1, -1, 1, 1, 1, 1, 1, 0]);
    this.quadVertexBuffer = this.device.createBuffer({
      size: quadVertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(this.quadVertexBuffer, 0, quadVertices);

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
    const { sharedSpriteBindGroupLayout, sharedSpritePipelineLayout, sharedSpritePipeline } = WebGPURenderer.createSharedSpriteResources(
      this.device,
      this.format,
      this.globalBindGroupLayout
    );
    this.sharedSpriteBindGroupLayout = sharedSpriteBindGroupLayout;
    this.sharedSpritePipelineLayout = sharedSpritePipelineLayout;
    this.sharedSpritePipeline = sharedSpritePipeline;

    // The renderer is ready
    this.initialised = true;
  }

  public createGPUSprite(sprite: Sprite) {
    if (this.gpuSprites.has(sprite.id)) {
      console.error("GPU sprite already exists for this sprite!");
      return;
    }

    const newGPUSprite = new GPUSprite(this.device, sprite, this.sharedSpriteBindGroupLayout);
    this.gpuSprites.set(sprite.id, newGPUSprite);
  }

  public destroyGPUSprite(id: SpriteId) {
    this.gpuSprites.delete(id);
  }

  public render(viewport: Viewport, scene: Scene) {
    if (!this.initialised) {
      console.log("Renderer is not initialized!");
      return;
    }

    // Update global buffer
    this.updateGlobalBuffer(viewport);

    // Get view and encoder
    const view = this.context.getCurrentTexture().createView();
    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view,
          clearValue: { r: 1, g: 0, b: 1, a: 1 },
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
    pass.setVertexBuffer(0, this.quadVertexBuffer);

    for (const [key, sprite] of scene.sprites) {
      const gpuSprite = this.gpuSprites.get(sprite.id);
      if (!gpuSprite) {
        throw Error(`No GPU sprite found for sprite id:${sprite.id}`);
      }

      if (sprite.isDirty) {
        gpuSprite.updateUniform(this.device, sprite.modelMatrix.data);
      }

      this.writeTexture(sprite.rect.width, sprite.rect.height, sprite.activeLayer.data, gpuSprite.texture);

      pass.setBindGroup(1, gpuSprite.bindGroup);
      pass.draw(6);
    }

    // Submit
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  private writeTexture(width: number, height: number, data: Uint8ClampedArray, texture: GPUTexture) {
    this.device.queue.writeTexture(
      { texture: texture },
      data as GPUAllowSharedBufferSource,
      {
        offset: 0,
        bytesPerRow: width * 4,
        rowsPerImage: height,
      },
      {
        width,
        height,
        depthOrArrayLayers: 1,
      }
    );
  }

  private updateGlobalBuffer(viewport: Viewport) {
    const camera = viewport.camera;

    const cameraBufferSize = 144;
    const globalData = new Float32Array(cameraBufferSize / 4);

    // Camera view projection matrix
    const viewProjectionData = camera.viewProjectionMatrix.data;
    globalData[0] = viewProjectionData[0];
    globalData[1] = viewProjectionData[1];
    globalData[2] = viewProjectionData[2];
    globalData[3] = viewProjectionData[3];
    globalData[4] = viewProjectionData[4];
    globalData[5] = viewProjectionData[5];
    globalData[6] = viewProjectionData[6];
    globalData[7] = viewProjectionData[7];
    globalData[8] = viewProjectionData[8];
    globalData[9] = viewProjectionData[9];
    globalData[10] = viewProjectionData[10];
    globalData[11] = viewProjectionData[11];
    globalData[12] = viewProjectionData[12];
    globalData[13] = viewProjectionData[13];
    globalData[14] = viewProjectionData[14];
    globalData[15] = viewProjectionData[15];

    // Camera inverse view projection matrix
    const inverseViewProjectionData = camera.invViewProjectionMatrix.data;
    globalData[16] = inverseViewProjectionData[0];
    globalData[17] = inverseViewProjectionData[1];
    globalData[18] = inverseViewProjectionData[2];
    globalData[19] = inverseViewProjectionData[3];
    globalData[20] = inverseViewProjectionData[4];
    globalData[21] = inverseViewProjectionData[5];
    globalData[22] = inverseViewProjectionData[6];
    globalData[23] = inverseViewProjectionData[7];
    globalData[24] = inverseViewProjectionData[8];
    globalData[25] = inverseViewProjectionData[9];
    globalData[26] = inverseViewProjectionData[10];
    globalData[27] = inverseViewProjectionData[11];
    globalData[28] = inverseViewProjectionData[12];
    globalData[29] = inverseViewProjectionData[13];
    globalData[30] = inverseViewProjectionData[14];
    globalData[31] = inverseViewProjectionData[15];

    // Screen size
    globalData[32] = viewport.width;
    globalData[33] = viewport.height;

    // World unit per pixel (camera's inverse zoom)
    globalData[34] = 1 / camera.zoom;

    this.device.queue.writeBuffer(this.globalUniformBuffer, 0, globalData.buffer);
  }

  // ========================================================
  // ----------------- Helper Functions ---------------------

  private static createGlobalBuffer(device: GPUDevice) {
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

  private static createBackgroundPassResources(device: GPUDevice, format: GPUTextureFormat, globalBindGroupLayout: GPUBindGroupLayout) {
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

    // gridSize
    backgroundData[8] = 64.0;
    backgroundData[9] = 64.0;

    // lineThickness
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

  private static createSharedSpriteResources(device: GPUDevice, format: GPUTextureFormat, globalBindGroupLayout: GPUBindGroupLayout) {
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

    return {
      sharedSpriteBindGroupLayout,
      sharedSpritePipelineLayout,
      sharedSpritePipeline,
    };
  }
}
