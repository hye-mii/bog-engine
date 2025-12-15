/**
 * Holds the WepGPU resources for global pass
 */
export interface GlobalPassResources {
  uniformBuffer: GPUBuffer;
  bindGroup: GPUBindGroup;
  bindGroupLayout: GPUBindGroupLayout;
}

/**
 * Create GPU resources for global uniforms
 */
export function createGlobalResources(device: GPUDevice): GlobalPassResources {
  const cameraBufferSize = 144;
  const uniformBuffer = device.createBuffer({
    size: cameraBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: "uniform" },
      },
    ],
  });
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  return {
    uniformBuffer,
    bindGroup,
    bindGroupLayout,
  };
}
