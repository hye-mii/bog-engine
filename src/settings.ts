export const Settings = {
  render: {
    PPU: 32, // 1 world unit = 32 pixels
    interval: 16.667, // Render interval in ms
  },

  camera: {
    size: 64, // Camera size in world unit
    zoomSpeed: 1.0015,
    minZoom: 0.2,
    maxZoom: 12.0,
  },
} as const;
