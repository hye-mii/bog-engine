import type { SpriteId, UInt } from "../types";
import { Sprite } from "../objects/sprite";

export class Scene {
  public sprites = new Map<string, Sprite>();

  private events = {
    spriteAdded: new Set<(sprite: Sprite) => void>(),
    spriteRemoved: new Set<(id: SpriteId) => void>(),
  };

  constructor() {}

  public onSpriteAdded(fn: (sprite: Sprite) => void) {
    this.events.spriteAdded.add(fn);
  }

  public onSpriteRemoved(fn: (id: SpriteId) => void) {
    this.events.spriteRemoved.add(fn);
  }

  public addSprite(width: UInt, height: UInt): SpriteId {
    const sprite = new Sprite(width, height);
    this.sprites.set(sprite.id, sprite);

    this.events.spriteAdded.forEach((fn) => fn(sprite));
    return sprite.id;
  }

  public removeSprite(id: SpriteId) {
    const sprite = this.sprites.get(id);
    if (sprite) {
      this.events.spriteRemoved.forEach((fn) => fn(sprite.id));
      this.sprites.delete(sprite.id);
    }
  }
}
