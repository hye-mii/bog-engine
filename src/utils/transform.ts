import { Quaternion } from "./quaternion";
import { Vector3 } from "./vector-3";

export class Transform {
  public readonly position: Vector3 = new Vector3(0, 0, 0);
  public readonly rotation: Quaternion = Quaternion.identity();
  public readonly scale: Vector3 = new Vector3(1, 1, 1);

  public get isDirty(): boolean {
    return this.position.isDirty || this.rotation.isDirty || this.scale.isDirty;
  }

  public clearDirty() {
    this.position.clearDirty();
    this.rotation.clearDirty();
    this.scale.clearDirty();
  }
}
