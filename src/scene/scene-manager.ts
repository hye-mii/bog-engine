import type { EventManager } from "../core/event-manager";
import { Scene } from "../scene/scene";
import { Vector2 } from "../utils/vector-2";

export class SceneManager {
  // Event varaibles
  private readonly _eventManager: EventManager;

  private _activeScene: Scene;

  constructor(eventManager: EventManager) {
    this._eventManager = eventManager;
    this._activeScene = new Scene(eventManager);
  }

  public updateScene(dt: number) {
    this._activeScene.update(dt);
  }

  public loadScene() {
    // Load a default testing scene
    const cameraId = this._activeScene.createCamera({
      name: "main-camera",
      width: 64,
      height: 64,
      zoom: 1,
      position: new Vector2(0, 0),
    });

    // A minecraft sword sprite
    this._activeScene.createSprite(16, 16, 0, 0);
  }

  public getActiveScene(): Scene {
    return this._activeScene;
  }
}
