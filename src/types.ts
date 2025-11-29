import type { Settings } from "./settings";

export type SettingsType = typeof Settings;
export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}
// export type Id = string;
// export type Timestamp = number;
// export type ColorHex = string;
// export type LayerIndex = number;
// export type FilePath = string;
// export type Opacity = number;
// export type Percentage = number;
// export type UUID = string;
// export type ProceduralSeed = number;

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

export type ExportFormat = "png" | "gif" | "json" | "spritesheet";
export type BrushShape = "circle" | "square" | "diamond" | "line";
export type BlendMode = "normal" | "replace" | "multiply" | "screen" | "add";
