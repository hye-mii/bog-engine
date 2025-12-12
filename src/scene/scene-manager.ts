import type { EventManager } from "../core/event-manager";
import { Scene } from "../scene/scene";
import { Vector2 } from "../utils/vector-2";

export class SceneManager {
  // Event varaibles
  private readonly _eventManager: EventManager;

  private activeScene: Scene;

  constructor(eventManager: EventManager) {
    this._eventManager = eventManager;
    this.activeScene = new Scene(eventManager);
  }

  public updateScene(dt: number) {
    this.activeScene?.update(dt);
  }

  public loadScene() {
    // Load a default testing scene
    const cameraId = this.activeScene.createCamera(
      {
        name: "main-camera",
        width: 64,
        height: 64,
        zoom: 1,
        position: new Vector2(0, 0),
      },
      true
    );
    const camera = this.activeScene.getCameraByID(cameraId)!;
    this.activeScene.createCameraController(
      {
        name: "main-camera-controller",
        zoomSpeed: 1.0015,
        zoomMin: 0.2,
        zoomMax: 12.0,
      },
      camera
    );

    // A minecraft sword sprite
    this.activeScene.createSprite(16, 16, 0, 0);
  }

  public getActiveScene(): Scene | null {
    return this.activeScene;
  }
}
