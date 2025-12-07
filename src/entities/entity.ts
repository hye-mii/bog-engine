import type { UUID } from "../types/basic-types";
import type { Vector3 } from "../utils/vector-3";
import type { Quaternion } from "../utils/quaternion";
import { generateUUID } from "../utils/math";
import { Transform } from "../utils/transform";

export abstract class Entity {
  public readonly id: UUID;
  public readonly name: string;
  protected readonly transform: Transform = new Transform();
  public get position(): Vector3 {
    return this.transform.position;
  }
  public get rotation(): Quaternion {
    return this.transform.rotation;
  }
  public get scale(): Vector3 {
    return this.transform.scale;
  }

  constructor(name: string) {
    this.id = generateUUID();
    this.name = name;
  }

  /**
   * Called each frame to update the entity.
   * @param dt Time elapsed since the last frame, in seconds.
   */
  public abstract update(dt: number): void;
}
