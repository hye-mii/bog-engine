import type { Camera } from "../entities/camera";
import type { Sprite } from "../entities/sprite";
import type { SpriteID } from "./entity-types";

export type EventID = string & { __brand: "128-bit Unique Number Identifier For Events" };

export type EventMap = {
  moveCamera: (deltaX: number, deltaY: number) => void;
  zoomCamera: (mouseX: number, mouseY: number, zoomDelta: number) => void;
  resizeViewport: (width: number, height: number) => void;

  onCameraCreated: (camera: Camera) => void;

  onSpriteAdded: (sprite: Sprite) => void;
  onSpriteDelete: (spriteID: SpriteID) => void;
};
export type EventType = keyof EventMap;
