import type { SpriteId, UInt } from "../types";
import { Sprite } from "../objects/sprite";
import { Vector2 } from "../utils/vector-2";

export class Scene {
  public sprites = new Map<string, Sprite>();

  // Event listeners
  private onSpriteAddedCallbacc: ((sprite: Sprite) => void)[] = [];
  private onSpriteRemovedCallbacc: ((id: SpriteId) => void)[] = [];

  constructor() {}

  public addSpriteAddedListener(callback: (sprite: Sprite) => void) {
    this.onSpriteAddedCallbacc.push(callback);
  }

  public addSpriteRemovedListener(callback: (id: SpriteId) => void) {
    this.onSpriteRemovedCallbacc.push(callback);
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

  public getSpriteAtWorld(position: Vector2): Sprite | undefined {
    const sortedSprites = [...this.sprites.values()].sort((a, b) => b.zIndex - a.zIndex);
    for (const sprite of sortedSprites) {
      if (sprite.contains(position)) return sprite;
    }
    return undefined;
  }
}
