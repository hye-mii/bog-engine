import { Color } from "../../utils/color";
import { Vector2 } from "../../utils/vector-2";

// Uniform Buffer Layout
// 16 (vec4<f32>) + 16 (vec4<f32>) + 8 (vec2<f32>) + 4 (f32) + 4 (padding) = 48 bytes
const BACKGROUND_UNIFORM_SIZE = 16 + 16 + 8 + 4 + 4;

// Default initial values
const BACKGROUND_COLOR_1 = new Color(0, 0, 0, 255);
const BACKGROUND_COLOR_2 = new Color(31, 31, 31, 255);
const BACKGROUND_GRID_SIZE = new Vector2(8, 8);
const BACKGROUND_LINE_THICKNESS = 1;

/**
 * Holds the GPU resources required to render the background pass
 */
export interface BackgroundPassResources {
  uniformBuffer: GPUBuffer;
  pipeline: GPURenderPipeline;
  bindGroupLayout: GPUBindGroupLayout;
  pipelineLayout: GPUPipelineLayout;
  bindGroup: GPUBindGroup;
  uniformData: Float32Array<ArrayBuffer>;
}

/**
 * Configuration settings for the background shader
 */
export interface BackgroundConfig {
  color1: Color;
  color2: Color;
  gridSize: Vector2;
  lineThickness: number;
}

/**
 * Allocates GPU resources for the background pass
 * Create background pass GPU resources
 */
export function createBackgroundResources(
  device: GPUDevice,
  format: GPUTextureFormat,
  globalBindGroupLayout: GPUBindGroupLayout,
  backgroundShaderWGSL: string
): BackgroundPassResources {
  // Uniform buffer for storing color and grid configuration
  const uniformBuffer = device.createBuffer({
    size: BACKGROUND_UNIFORM_SIZE,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    label: "Background Uniform Buffer",
  });

  // Create bind group layout
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
        buffer: { type: "uniform" },
      },
    ],
    label: "Background Bind Group Layout",
  });

  // Create pipeline and pipeline layout
  const pipelineLayout = device.createPipelineLayout({
    // Group 0: Global, Group 1: Background
    bindGroupLayouts: [globalBindGroupLayout, bindGroupLayout],
  });

  const backgroundShaderModule = device.createShaderModule({
    code: backgroundShaderWGSL,
    label: "Background Shader Module",
  });
  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: backgroundShaderModule,
      entryPoint: "vs_main",
      buffers: [
        // Vertex Layout: [x, y, u, v]
        {
          arrayStride: 4 * 4,
          attributes: [
            {
              // pos (x, y)
              shaderLocation: 0,
              offset: 0,
              format: "float32x2",
            },
            {
              // uv (x, y)
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

  // Background-specific uniforms
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: { buffer: uniformBuffer },
      },
    ],
  });

  const resources: BackgroundPassResources = {
    uniformBuffer,
    pipeline,
    bindGroupLayout,
    pipelineLayout,
    bindGroup,
    uniformData: new Float32Array(BACKGROUND_UNIFORM_SIZE / 4),
  };

  // Initialize buffer with default values
  updateBackgroundBuffer(device, resources, {
    color1: BACKGROUND_COLOR_1,
    color2: BACKGROUND_COLOR_2,
    gridSize: BACKGROUND_GRID_SIZE,
    lineThickness: BACKGROUND_LINE_THICKNESS,
  });

  return resources;
}

/**
 * Updates the uniform buffer on the GPU
 */
export function updateBackgroundBuffer(device: GPUDevice, resources: BackgroundPassResources, config: BackgroundConfig): void {
  const { uniformData, uniformBuffer } = resources;

  // backgroundColor (normalized 0-1)
  uniformData[0] = config.color1.r / 255;
  uniformData[1] = config.color1.g / 255;
  uniformData[2] = config.color1.b / 255;
  uniformData[3] = config.color1.a / 255;

  // lineColor (normalized 0-1)
  uniformData[4] = config.color2.r / 255;
  uniformData[5] = config.color2.g / 255;
  uniformData[6] = config.color2.b / 255;
  uniformData[7] = config.color2.a / 255;

  // gridSize in world unit
  uniformData[8] = config.gridSize.x;
  uniformData[9] = config.gridSize.y;

  // lineThickness in pixels
  uniformData[10] = config.lineThickness;

  // Upload buffer
  device.queue.writeBuffer(uniformBuffer, 0, uniformData, 0, uniformData.length);
}
