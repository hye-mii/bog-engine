import type { Vector2 } from "../utils/vector-2";

export type SpriteID = string & { __brand: "128-bit Unique Number Identifier For Sprites" };

interface EntityConfig {
  name: string;
}

export interface CameraConfig extends EntityConfig {
  width: number;
  height: number;
  zoom: number;
  position: Vector2;
}

export interface CameraControllerConfig extends EntityConfig {
  zoomSpeed: number;
  zoomMin: number;
  zoomMax: number;
}

