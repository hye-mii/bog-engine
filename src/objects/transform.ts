import { Quaternion } from "../utils/quaternion";
import { Vector3 } from "../utils/vector-3";

export class Transform {
  public position: Vector3 = new Vector3(0, 0, 0);
  public rotation: Quaternion = Quaternion.identity();
  public scale: Vector3 = new Vector3(1, 1, 1);
  public pivot: Vector3 = new Vector3(0, 0, 0);
}
