import type { CameraConfig, CameraControllerConfig } from "../types/entity-types";
import type { UUID } from "../types/basic-types";
import { Camera } from "../entities/camera";
import { CameraController } from "../entities/camera-controller";
import { Sprite } from "../entities/sprite";
import type { EventManager } from "../core/event-manager";

export class Scene {
  // Event varaibles
  private readonly _eventManager: EventManager;

  private _activeCamera: Camera | null = null;
  private readonly _sprites: Map<string, Sprite> = new Map();
  private readonly _cameras: Map<string, Camera> = new Map();
  private readonly _cameraControllers: Map<string, CameraController> = new Map();

  constructor(eventManager: EventManager) {
    this._eventManager = eventManager;
  }
  public get sprites(): Sprite[] {
    return [...this._sprites.values()];
  }
  public get cameras(): Camera[] {
    return [...this._cameras.values()];
  }
  public get cameraControllers(): CameraController[] {
    return [...this._cameraControllers.values()];
  }

  public update(dt: number) {
    this._sprites.forEach((sprite) => sprite.update(dt));
    this._cameras.forEach((camera) => camera.update(dt));
    this._cameraControllers.forEach((controller) => controller.update(dt));
  }

  public getSpriteByID(id: UUID): Sprite | undefined {
    return this._sprites.get(id);
  }

  public getCameraByID(id: UUID): Camera | undefined {
    return this._cameras.get(id);
  }

  public getCameraControllerByID(id: UUID): CameraController | undefined {
    return this._cameraControllers.get(id);
  }

  public createCamera(cameraConfig: CameraConfig, isActiveCamera: boolean): UUID {
    const newCamera = new Camera(cameraConfig);
    this._cameras.set(newCamera.id, newCamera);
    if (isActiveCamera) this._activeCamera = newCamera;
    return newCamera.id;
  }

  public createCameraController(controllerConfig: CameraControllerConfig, cameraToAttach: Camera): UUID {
    const newController = new CameraController(controllerConfig, cameraToAttach);
    this._cameraControllers.set(newController.id, newController);
    return newController.id;
  }

  public createSprite(width: number, height: number, x: number, y: number): UUID {
    const newSprite = new Sprite(width, height, x, y);
    this._sprites.set(newSprite.id, newSprite);

    // Notify event manager
    this._eventManager.fire("onSpriteAdded", newSprite);

    return newSprite.id;
  }
}
