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

  public resize(width: UInt, height: UInt) {
    this._width = width;
    this._height = height;

    // Update camera to take the correct full viewport width and height
    this.camera.rect.width = width;
    this.camera.rect.height = height;

    // Update camera matrices
    this.camera.updateMatrices();
  }
}
