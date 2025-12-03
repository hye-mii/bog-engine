import type { Camera } from "../src/objects/camera";
import type { WeakVector2 } from "../src/types";

export const CameraTests = {
  screenToWorld(
    camera: Camera,
    viewportWidth: number,
    viewportHeight: number,
    cameraWidth: number,
    cameraHeight: number,
    cameraX: number,
    cameraY: number,
    cameraZoom: number
  ) {
    // Testing variables
    const endX = viewportWidth;
    const endY = viewportHeight;
    const centerX = endX / 2;
    const centerY = endY / 2;

    // Test x-axis only
    for (let x = 0; x < endX; x++) {
      const result = camera.screenToWorld(x, centerY);
      const expectedX = cameraX + ((x - viewportWidth / 2) * (cameraWidth / viewportWidth)) / cameraZoom;
      const expectedY = cameraY;
      expect(result.x, expectedX, 0.0000000001);
      expect(result.y, expectedY, 0.0000000001);
    }
    console.debug("X-axis only test passed!");

    // Test y-axis only
    for (let y = 0; y < endY; y++) {
      const result = camera.screenToWorld(centerX, y);
      const expectedX = cameraX;
      //   const expectedY = cameraY + (cameraHeight / viewportHeight) * (viewportHeight / 2 - y);
      const expectedY = cameraY - ((y - viewportHeight / 2) * (cameraHeight / viewportHeight)) / cameraZoom;
      expect(result.x, expectedX, 0.0000000001);
      expect(result.y, expectedY, 0.0000000001);
    }
    console.debug("Y-axis only test passed!");

    // Test both x and y axes
    for (let x = 0; x < endX; x++) {
      for (let y = 0; y < endY; y++) {
        const result = camera.screenToWorld(x, y);
        const expectedX = cameraX + ((x - viewportWidth / 2) * (cameraWidth / viewportWidth)) / cameraZoom;
        const expectedY = cameraY - ((y - viewportHeight / 2) * (cameraHeight / viewportHeight)) / cameraZoom;
        expect(result.x, expectedX, 0.0000000001);
        expect(result.y, expectedY, 0.0000000001);
      }
    }
    console.debug("X-axis and Y-axis test passed!");

    // Test X-axis increasing, Y-axis decreasing
    for (let i = 0; i < Math.min(endX, endY); i++) {
      const x = i;
      const y = endY - i;
      const result = camera.screenToWorld(x, y);
      const expectedX = cameraX + ((x - viewportWidth / 2) * (cameraWidth / viewportWidth)) / cameraZoom;
      const expectedY = cameraY - ((y - viewportHeight / 2) * (cameraHeight / viewportHeight)) / cameraZoom;
      expect(result.x, expectedX, 0.0000000001);
      expect(result.y, expectedY, 0.0000000001);
    }
    console.debug(" X-axis increasing, Y-axis decreasing test passed!");
  },
};

function expect(v: number, e: number, t: number) {
  const leastExpected = e + t;
  const mostExpected = e - t;
  if (v < leastExpected && v > mostExpected) {
    return;
  } else {
    throw Error(`Expected value didn't match test value. Expected ${t}, found ${v}`);
  }
}
