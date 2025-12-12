import type { CameraConfig } from "../types/entity-types";
import type { UUID } from "../types/basic-types";
import { Camera } from "../entities/camera";
import { Sprite } from "../entities/sprite";
import type { EventManager } from "../core/event-manager";

export class Scene {
  // World scene data
  private readonly _sprites: Map<string, Sprite> = new Map();
  private readonly _cameras: Map<string, Camera> = new Map();

  // Event varaibles
  private readonly _eventManager: EventManager;

  constructor(eventManager: EventManager) {
    this._eventManager = eventManager;
  }
  public get sprites(): Sprite[] {
    return [...this._sprites.values()];
  }

  /**
   * Updates all entities in the scene
   */
  public update(dt: number) {
    this._sprites.forEach((sprite) => sprite.update(dt));
    this._cameras.forEach((camera) => camera.update(dt));
  }

  /**
   * Creates a new camera entity and adds it to the scene
   */
  public createCamera(cameraConfig: CameraConfig): UUID {
    const newCamera = new Camera(cameraConfig);
    this._cameras.set(newCamera.id, newCamera);

    // Notify event manager
    this._eventManager.fire("onCameraCreated", newCamera);

    return newCamera.id;
  }

  /**
   * Creates a new sprite entity and adds it to the scene
   */
  public createSprite(width: number, height: number, x: number, y: number): UUID {
    const newSprite = new Sprite(width, height, x, y);
    this._sprites.set(newSprite.id, newSprite);

    // Notify event manager
    this._eventManager.fire("onSpriteAdded", newSprite);

    return newSprite.id;
  }
}
