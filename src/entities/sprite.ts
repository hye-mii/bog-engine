import type { PixelDataRGBA } from "../types/basic-types";
import { Entity } from "./entity";
import { Matrix4 } from "../utils/matrix-4";
import { Rect } from "../utils/rect";
import { Layer } from "../scene/layer";

export class Sprite extends Entity {
  public opacity = 1;
  public visible = true;
  public zIndex = 0;

  private readonly _rect: Rect;
  public readonly modelMatrix = new Matrix4();

  // Data variables
  private readonly _flattenedData: PixelDataRGBA;
  private readonly _layers: Layer[] = [];
  private _isFlattendedDataDirty: boolean = true;

  constructor(width: number, height: number, x: number, y: number) {
    super("sprite");
    this._rect = new Rect(0.5, 0.5, width, height);
    this.position.set(x, y, 0);

    // Create an empty flattened data
    this._flattenedData = new Uint8Array(width * height * 4) as PixelDataRGBA;

    // Create a default plain white layer
    const defaultLayer = new Layer(width, height, "normal");
    this._layers.push(defaultLayer);

    // Force update sprite's flattened data and model matrix
    this.updateFlattenedData();
    this.updateModelMatrix();
  }

  public get width(): number {
    return this._rect.width;
  }
  public get height(): number {
    return this._rect.height;
  }
  public get flattenedData(): PixelDataRGBA {
    return this._flattenedData;
  }

  /**
   * Called each frame to update the entity.
   * @param dt Time elapsed since the last frame, in seconds.
   */
  public update(dt: number): void {
    if (this._isFlattendedDataDirty) {
      this._isFlattendedDataDirty = false;
      this.updateFlattenedData();
    }

    if (this.transform.isDirty) {
      this.transform.clearDirty();
      this.updateModelMatrix();
    }
  }

  /**
   * Called by the renderer to update flattened data on marked dirty
   */
  private updateFlattenedData() {
    // ~ temporary code, add color utils for proper copying of layers
    const spriteSize = this._flattenedData.length;
    for (let i = 0; i < this._layers.length; i++) {
      const layer = this._layers[i];

      if (layer.data.length !== spriteSize) {
        throw Error(
          `Layer ${i} data length (${layer.data.length}) does not match expected sprite size (${spriteSize}) for sprite ID ${this.id}.`
        );
      }

      for (let i = 0; i < spriteSize; i++) {
        this._flattenedData[i] = layer.data[i];
      }
    }
  }

  /**
   * Updates the sprite's model matrix based on its current transform and rect
   */
  private updateModelMatrix() {
    // Pivot offsets (normalized 0–1)
    const pivotOffsetX = this._rect.x;
    const pivotOffsetY = this._rect.y;

    // Combine sprite pixel size with world scale
    const scaleX = this._rect.width * this.scale.x;
    const scaleY = this._rect.height * this.scale.y;

    // Apply Translate -> Rotate -> Scale -> Pivot
    this.modelMatrix.identity();
    this.modelMatrix.translateXY(this.position.x, this.position.y);

    // ~ todo: quaternion에서 Z축 rad 값 가져오는 함수 만들어야 함
    // modelMatrix.rotateZ(...);

    this.modelMatrix.scaleXY(scaleX, scaleY);
    this.modelMatrix.translateXY(-pivotOffsetX, -pivotOffsetY);
  }
}
