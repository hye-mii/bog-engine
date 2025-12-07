export type UUID = string & { __brand: "128-bit Unique Number Identifier" };
export type UInt = number & { __brand: "128-bit Unique Number Identifier" };
export type PixelDataRGBA = Uint8Array & { __brand: "Pixel Data In RGBA Format" };

/** A plain readonly Vector2 */
export interface WeakVector2 {
  x: number;
  y: number;
}
