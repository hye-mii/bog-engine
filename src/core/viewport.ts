import type { CameraConfig, UInt } from "../types";
import { Camera } from "../objects/camera";
import { CameraController } from "../objects/camera-controller";

export class Viewport {
  private _width: UInt;
  private _height: UInt;

  public readonly camera: Camera;
  public readonly cameraController: CameraController;

  constructor(width: number, height: number, cameraConfig: CameraConfig) {
    this._width = Math.max(1, width) as UInt;
    this._height = Math.max(1, height) as UInt;

    this.camera = new Camera(this, cameraConfig);
    this.cameraController = new CameraController(this, this.camera, cameraConfig);

    // Set camera's aspect ratio
    this.camera.setAspect(this._width, this._height);
  }
  public get width(): UInt {
    return this._width;
  }
  public get height(): UInt {
    return this._height;
  }

  /**
   * Resize the viewport and update the camera's projection matrices
   */
  public resize(width: number, height: number) {
    this._width = Math.max(1, width) as UInt;
    this._height = Math.max(1, height) as UInt;

    // Set camera's new aspect ratio
    this.camera.setAspect(this._width, this._height);
  }
}
