import type { SpriteId, UInt } from "../types";
import { Sprite } from "../objects/sprite";
import type { WebGPURenderer } from "./renderer";

export class Scene {
  public sprites = new Map<string, Sprite>();

  private events = {
    spriteAdded: new Set<(sprite: Sprite) => void>(),
    spriteRemoved: new Set<(id: SpriteId) => void>(),
  };

  constructor(renderer: WebGPURenderer) {
    this.onSpriteAdded((sprite: Sprite) => {
      renderer.createGPUSprite(sprite);
    });
    this.onSpriteRemoved((id: SpriteId) => {
      renderer.destroyGPUSprite(id);
    });
  }

  public onSpriteAdded(fn: (sprite: Sprite) => void) {
    this.events.spriteAdded.add(fn);
  }

  public onSpriteRemoved(fn: (id: SpriteId) => void) {
    this.events.spriteRemoved.add(fn);
  }

  public addSprite(width: UInt, height: UInt): SpriteId {
    // Add a new sprite
    const sprite = new Sprite(width, height);
    this.sprites.set(sprite.id, sprite);

    // Notify listeners
    this.events.spriteAdded.forEach((fn) => fn(sprite));
    return sprite.id;
  }

  public removeSprite(id: SpriteId): boolean {
    const sprite = this.sprites.get(id);
    if (!sprite) {
      return false; // Failed to remove sprite sucessfully
    }

    // Notify listeners
    this.events.spriteRemoved.forEach((fn) => fn(sprite.id));

    // Remove the sprite
    this.sprites.delete(sprite.id);
    return true;
  }
}
