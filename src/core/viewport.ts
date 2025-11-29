import type { UInt } from "../types";
import { BogEngine } from "./bog-engine";
import { Camera } from "../objects/camera";
import { CameraController } from "../objects/camera-controller";

export class Viewport {
  private readonly engine: BogEngine;
  private _width: UInt;
  private _height: UInt;
  public readonly camera: Camera;
  public readonly cameraController: CameraController;

  constructor(engine: BogEngine, width: UInt, height: UInt) {
    this.engine = engine;
    this._width = width;
    this._height = height;
    this.camera = new Camera(width, height);
    this.cameraController = new CameraController(engine, this.camera);
  }
  public get width() {
    return this._width;
  }
  public get height(): UInt {
    return this._height;
  }

  /**
   * Resize the viewport and update the camera's projection matrices
   */
  public resize(width: UInt, height: UInt) {
    this._width = width;
    this._height = height;

    // Resize camera to take the correct full viewport width and height
    this.camera.setSize(width, height);
  }
}
