import type { SpriteId, UInt, WeakVector2 } from "../types";
import { Sprite } from "../objects/sprite";
import { Vector2 } from "../utils/vector-2";
import type { Camera } from "../objects/camera";
import type { CameraController } from "../objects/camera-controller";

enum EditorMode {
  Object = 0,
  Edit = 1,
}

export class Scene {
  private mode: EditorMode = EditorMode.Object;

  // Event listeners
  private onSpriteAddedCallbacc: ((sprite: Sprite) => void)[] = [];
  private onSpriteRemovedCallbacc: ((id: SpriteId) => void)[] = [];

  public sprites = new Map<string, Sprite>();

  constructor() {}

  public addSpriteAddedListener(callback: (sprite: Sprite) => void) {
    this.onSpriteAddedCallbacc.push(callback);
  }

  public addSpriteRemovedListener(callback: (id: SpriteId) => void) {
    this.onSpriteRemovedCallbacc.push(callback);
  }

  public onDoubleClick(mousePosition: Vector2, camera: Camera, controller: CameraController) {
    if (this.mode === EditorMode.Edit) return;

    const worldPosition = camera.screenToWorld(mousePosition.x, mousePosition.y);
    const sprite = this.getSpriteAtWorld(worldPosition);
    if (sprite) {
      this.mode = EditorMode.Edit;
      sprite.addLayer("normal");

      // Move the camera
      // camera.setPosition(sprite.transform.position.x, sprite.transform.position.y);
      // camera.setZoom((camera.height / sprite.rect.height) * 0.8);
      controller.moveTo(sprite.transform.position.x, sprite.transform.position.y);
      controller.zoomTo((camera.height / sprite.rect.height) * 0.8);
    }
  }

  public addSprite(width: UInt, height: UInt, x: number, y: number): SpriteId {
    // Add a new sprite
    const sprite = new Sprite(width, height, x, y);
    this.sprites.set(sprite.id, sprite);

    // Notify listeners
    this.onSpriteAddedCallbacc.forEach((fn) => fn(sprite));
    return sprite.id;
  }

  public removeSprite(id: SpriteId): boolean {
    const sprite = this.sprites.get(id);
    if (!sprite) {
      return false; // Failed to remove sprite sucessfully
    }

    // Notify listeners
    this.onSpriteRemovedCallbacc.forEach((fn) => fn(sprite.id));

    // Remove the sprite
    this.sprites.delete(sprite.id);
    return true;
  }

  public getSpriteAtWorld(position: Vector2 | WeakVector2): Sprite | undefined {
    const sortedSprites = [...this.sprites.values()].sort((a, b) => b.zIndex - a.zIndex);
    for (const sprite of sortedSprites) {
      if (sprite.contains(position)) return sprite;
    }
    return undefined;
  }
}
