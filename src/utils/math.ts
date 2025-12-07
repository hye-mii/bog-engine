import type { UUID } from "../types/basic-types";

export function generateUUID(): UUID {
  return crypto.randomUUID() as UUID;
}

export function seededFromUUID(uuid: string) {
  return uuid.split("").map((c) => c.charCodeAt(0) / 255);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// export function generateHashedId(): string {
//   return null!;
// }
