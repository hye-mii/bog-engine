import type { Sprite } from "../../entities/sprite";
import type { PixelDataRGBA } from "../../types/basic-types";

export class GPUSprite {
  public id: string;
  public sampler: GPUSampler;
  public texture: GPUTexture;
  public textureView: GPUTextureView;
  public uniformBuffer: GPUBuffer;
  public bindGroup: GPUBindGroup;

  constructor(device: GPUDevice, sprite: Sprite, sharedBindGroupLayout: GPUBindGroupLayout) {
    this.id = sprite.id;

    this.sampler = GPUSprite.createSampler(device);
    this.texture = GPUSprite.createTexture(device, sprite.width, sprite.height);
    this.textureView = GPUSprite.createTextureView(this.texture);
    this.uniformBuffer = GPUSprite.createUniformBuffer(device);
    this.bindGroup = GPUSprite.createBindGroup(device, sharedBindGroupLayout, this.uniformBuffer, this.texture, this.sampler);

    this.uploadSpriteTexture(device, this.texture, sprite.flattenedData, sprite.width, sprite.height);
    this.updateUniform(device, sprite.modelMatrix.data);
  }

  /**
   * Upload pixel data to the GPU texture
   */
  public uploadSpriteTexture(device: GPUDevice, texture: GPUTexture, pixelData: PixelDataRGBA, width: number, height: number) {
    device.queue.writeTexture(
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

  public updateUniform(device: GPUDevice, modelMatrixData: Float32Array) {
    const bufferData = new Float32Array(96 / 4);
    bufferData[0] = modelMatrixData[0];
    bufferData[1] = modelMatrixData[1];
    bufferData[2] = modelMatrixData[2];
    bufferData[3] = modelMatrixData[3];
    bufferData[4] = modelMatrixData[4];
    bufferData[5] = modelMatrixData[5];
    bufferData[6] = modelMatrixData[6];
    bufferData[7] = modelMatrixData[7];
    bufferData[8] = modelMatrixData[8];
    bufferData[9] = modelMatrixData[9];
    bufferData[10] = modelMatrixData[10];
    bufferData[11] = modelMatrixData[11];
    bufferData[12] = modelMatrixData[12];
    bufferData[13] = modelMatrixData[13];
    bufferData[14] = modelMatrixData[14];
    bufferData[15] = modelMatrixData[15];

    device.queue.writeBuffer(this.uniformBuffer, 0, bufferData.buffer);
  }

  private static createTexture(device: GPUDevice, width: number, height: number): GPUTexture {
    const outTexture = device.createTexture({
      size: [width, height, 1],
      format: "rgba8unorm",
      usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
    });

    return outTexture;
  }

  private static createTextureView(texture: GPUTexture): GPUTextureView {
    return texture.createView();
  }

  private static createUniformBuffer(device: GPUDevice): GPUBuffer {
    return device.createBuffer({
      size: 96,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  private static createBindGroup(
    device: GPUDevice,
    sharedBindGroupLayout: GPUBindGroupLayout,
    uniformBuffer: GPUBuffer,
    texture: GPUTexture,
    sampler: GPUSampler
  ): GPUBindGroup {
    return device.createBindGroup({
      layout: sharedBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: uniformBuffer },
        },
        { binding: 1, resource: texture.createView() },
        { binding: 2, resource: sampler },
      ],
    });
  }

  private static createSampler(device: GPUDevice) {
    return device.createSampler({
      magFilter: "nearest",
      minFilter: "nearest",
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
    });
  }
}
