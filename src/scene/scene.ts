import type { CameraConfig, CameraControllerConfig } from "../types/entity-types";
import type { UUID } from "../types/basic-types";
import { Camera } from "../entities/camera";
import { CameraController } from "../entities/camera-controller";
import { Sprite } from "../entities/sprite";
import type { EventManager } from "../core/event-manager";

export class Scene {
  // Event varaibles
  private readonly _eventManager: EventManager;

  private activeCamera: Camera | null = null;
  private readonly sprites: Map<string, Sprite> = new Map();
  private readonly cameras: Map<string, Camera> = new Map();
  private readonly cameraControllers: Map<string, CameraController> = new Map();

  constructor(eventManager: EventManager) {
    this._eventManager = eventManager;
  }

  public update(dt: number) {
    this.sprites.forEach((sprite) => sprite.update(dt));
    this.cameras.forEach((camera) => camera.update(dt));
    this.cameraControllers.forEach((controller) => controller.update(dt));
  }

  public getActiveCamera(): Camera | null {
    return this.activeCamera;
  }

  public getSpriteByID(id: UUID): Sprite | undefined {
    return this.sprites.get(id);
  }

  public getCameraByID(id: UUID): Camera | undefined {
    return this.cameras.get(id);
  }

  public getCameraControllerByID(id: UUID): CameraController | undefined {
    return this.cameraControllers.get(id);
  }

  public getAnyCameraController(): CameraController | undefined {
    return this.cameraControllers.values().next().value;
  }

  public getAllSprites(): Sprite[] {
    return [...this.sprites.values()];
  }

  public createCamera(cameraConfig: CameraConfig, isActiveCamera: boolean): UUID {
    const newCamera = new Camera(cameraConfig);
    this.cameras.set(newCamera.id, newCamera);
    if (isActiveCamera) this.activeCamera = newCamera;
    return newCamera.id;
  }

  public createCameraController(controllerConfig: CameraControllerConfig, cameraToAttach: Camera): UUID {
    const newController = new CameraController(controllerConfig, cameraToAttach);
    this.cameraControllers.set(newController.id, newController);
    return newController.id;
  }

  public createSprite(width: number, height: number, x: number, y: number): UUID {
    const newSprite = new Sprite(width, height, x, y);
    this.sprites.set(newSprite.id, newSprite);

    // Notify event manager
    this._eventManager.fire("onSpriteAdded", newSprite);

    return newSprite.id;
  }
}
