import type { Normalized, UInt } from "../types";
import { Vector2 } from "../utils/vector-2";
import { Vector4 } from "../utils/vector-4";
import { Matrix4 } from "../utils/matrix-4";
import { Transform } from "./transform";
import { Rect } from "./rect";

export class Camera {
  public readonly transform: Transform = new Transform();
  public readonly rect: Rect = new Rect(0.5 as Normalized, 0.5 as Normalized, 1, 1);
  public zoom: number = 1.0;
  public projectionMatrix: Matrix4 = new Matrix4();
  public viewMatrix: Matrix4 = new Matrix4();
  public viewProjectionMatrix: Matrix4 = new Matrix4();
  public invViewProjectionMatrix: Matrix4 = new Matrix4();

  constructor(width: UInt, height: UInt) {
    this.rect.width = width;
    this.rect.height = height;
    this.updateMatrices();
  }

  public screenToWorld(screenX: number, screenY: number): Vector2 {
    // Convert screen coords to NDC ( -1 to +1 )
    const ndcX = 2 * (screenX / this.rect.width) - 1;
    const ndcY = 1 - 2 * (screenY / this.rect.height);

    // Transform by inverse matrix and return
    const worldPosition = Matrix4.transform(new Vector4(ndcX, ndcY, 0, 1), this.invViewProjectionMatrix.data);

    const w = worldPosition.w;
    return new Vector2(worldPosition.x / w, worldPosition.y / w);
  }

  public updateMatrices() {
    // Update ortho matrix
    const width = (this.rect.width / this.zoom) * this.rect.x;
    const height = (this.rect.height / this.zoom) * this.rect.y;
    this.projectionMatrix.orthographic(-width, width, -height, height, -1, 1);

    // Apply Scale -> Rotate -> Translate
    this.viewMatrix.identity();
    this.viewMatrix.scale(this.transform.scale.x, this.transform.scale.y, this.transform.scale.z);

    // ! todo: 이 함수는 matrix4에 구현할 것
    //this.viewMatrix.fromQuaternion(this.transform.rotation);

    this.viewMatrix.translateXY(this.transform.position.x, this.transform.position.y);

    // View projection = projection * view
    this.viewProjectionMatrix.multiply2(this.projectionMatrix.data, this.viewMatrix.data);

    // Inverse view projection
    this.invViewProjectionMatrix.invert(this.viewProjectionMatrix.data);
  }
}
