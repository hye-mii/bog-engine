import type { Settings } from "./settings";
import type { Vector2 } from "./utils/vector-2";

export type ExportFormat = "png" | "gif" | "json" | "spritesheet";
export type BrushShape = "circle" | "square" | "diamond" | "line";
export type BlendMode = "normal" | "replace" | "multiply" | "screen" | "add";

type Brand<T, A> = T & { readonly __brand: A };

export type SpriteId = Brand<string, "Sprite Id">;
export type TaskId = Brand<string, "Task Id">;
export type Normalized = Brand<number, "Normalized Number">;
export type Index = Brand<number, "Index">;
export type UInt = Brand<number, "Unsiged Integer">;
export type UInt8 = Brand<number, "8-Bit Unsiged Integer">;
export type Int = Brand<number, "Signed Integer">;
export type PixelDataRGBA = Uint8Array & { __brand: "Pixel Data In RGBA Format" };
export type PixelDataBGRA = Uint8Array & { __brand: "Pixel Data In BGRA Format" };

// export type Id = string;
// export type Timestamp = number;
// export type ColorHex = string;
// export type LayerIndex = number;
// export type FilePath = string;
// export type Opacity = number;
// export type Percentage = number;
// export type UUID = string;
// export type ProceduralSeed = number;

export type SettingsType = typeof Settings;
export interface CameraConfig {
  width: number;
  height: number;
  zoom: number;
  position: Vector2;

  zoomSpeed: number;
  minZoom: number;
  maxZoom: number;
}

/** A plane readonly Vector2 */
export interface WeakVector2 {
  x: number;
  y: number;
}
