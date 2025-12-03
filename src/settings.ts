import type { CameraConfig } from "./types";
import { Vector2 } from "./utils/vector-2";

export const Settings = {
  render: {
    PPU: 32, // 1 world unit = 32 pixels
    interval: 16.667, // Render interval in ms
  },

  camera: {
    width: 64,
    height: 64,
    zoom: 1,
    position: new Vector2(0, 0),

    zoomSpeed: 1.0015,
    minZoom: 0.2,
    maxZoom: 12.0,
  } as CameraConfig,
} as const;
