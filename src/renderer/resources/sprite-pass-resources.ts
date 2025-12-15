/**
 * Holds the WebGPU resources used to render sprites
 */
export interface SpritePassResources {
  uniformBuffer: GPUBuffer;
  pipeline: GPURenderPipeline;
  bindGroupLayout: GPUBindGroupLayout;
  pipelineLayout: GPUPipelineLayout;
}

/**
 * Create GPU resources for the sprite rendering pass
 */
export function createSpriteResources(
  device: GPUDevice,
  format: GPUTextureFormat,
  globalBindGroupLayout: GPUBindGroupLayout,
  spriteShaderWGSL: string
): SpritePassResources {
  const bindGroupLayout = device.createBindGroupLayout({
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

  const pipelineLayout = device.createPipelineLayout({
    // Group 0: Global, Group 1: Sprite
    bindGroupLayouts: [globalBindGroupLayout, bindGroupLayout],
  });

  const spriteShaderModule = device.createShaderModule({ code: spriteShaderWGSL, label: "Sprite Shader Module" });

  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
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
  const uniformBuffer = device.createBuffer({
    size: spriteVertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(uniformBuffer, 0, spriteVertices);

  return {
    uniformBuffer,
    pipeline,
    bindGroupLayout,
    pipelineLayout,
  };
}
