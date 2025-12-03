import type { BlendMode, Index, Normalized, PixelDataRGBA, SpriteId, UInt, WeakVector2 } from "../types";
import { generateHashedId } from "../utils/math";
import { Matrix4 } from "../utils/matrix-4";
import { Vector2 } from "../utils/vector-2";
import { Color } from "./color";
import { Layer } from "./layer";
import { Modifier } from "./modifier";
import { Rect } from "./rect";
import { Transform } from "./transform";

export class Sprite {
  // Identification
  public readonly id: SpriteId;
  public readonly name: string;

  // State
  public opacity = 1;
  public visible = true;
  public zIndex = 0;

  // Transform Components
  public readonly modelMatrix = new Matrix4();
  private readonly rect: Rect;
  private readonly transform: Transform = new Transform();

  // Sprite Data
  public readonly flattenedData: PixelDataRGBA;
  private activeLayerIndex = 0;
  private layers: Layer[] = [];
  private modifiers: Modifier[] = [];

  // Dirty flags
  private _isMatrixDirty: boolean;
  private _isFlattendedDataDirty: boolean;

  constructor(width: UInt, height: UInt, x: number, y: number) {
    this.id = generateHashedId(6) as SpriteId;
    this.name = `Sprite_${this.id}`;
    this.rect = new Rect(0.5, 0.5, width, height);
    this.transform.position.x = x;
    this.transform.position.y = y;

    // Create an empty flattened data
    this.flattenedData = new Uint8Array(width * height * 4) as PixelDataRGBA;

    // Create a default plain white layer
    const defaultLayer = new Layer(width, height, "normal");
    this.layers.push(defaultLayer);

    // Matrix and Flattened data are dirty
    this._isMatrixDirty = true;
    this._isFlattendedDataDirty = true;
  }
  public get isMatrixDirty(): boolean {
    return this._isMatrixDirty;
  }
  public get isFlattendedDataDirty(): boolean {
    return this._isFlattendedDataDirty;
  }
  public get width(): number {
    return this.rect.width;
  }
  public get height(): number {
    return this.rect.height;
  }

  private set isMatrixDirty(v: boolean) {
    this._isMatrixDirty = v;
  }
  private set isFlattendedDataDirty(v: boolean) {
    this._isFlattendedDataDirty = v;
  }

  /**
   * Set new position for this sprite
   */
  public setPosition(newX: number, newY: number) {
    this.transform.position.x = newX;
    this.transform.position.y = newY;
    this.isMatrixDirty = true; // Update model matrix this frame
  }

  /**
   * Adds new layer... duh
   */
  public addLayer(blendMode: BlendMode, setActive: boolean = true) {
    const newLayer = new Layer(this.rect.width as UInt, this.rect.height as UInt, blendMode);
    newLayer.fill(new Color(255, 255, 255, 255));
    this.layers.push(newLayer);

    // Set this layer as active
    if (setActive) {
      this.activeLayerIndex = this.layers.length - 1;
    }

    // Recalculate sprite's flattened data
    this.isFlattendedDataDirty = true;
  }

  /**
   * Remove layer at index, returns false if no sprite exists there
   */
  public removeLayerAt(index: Index) {
    // Base layer ( index = 0 ) cannot be removed
    if (index < 1 || index >= this.layers.length) {
      return false;
    }

    // Remove the layer
    this.layers.splice(index, 1);

    // Update active layer
    const len = this.layers.length;
    if (this.activeLayerIndex >= len) {
      this.activeLayerIndex = len - 1;
    }

    // Recalculate sprite's flattened data
    this.isFlattendedDataDirty = true;
  }

  /**
   * Removes top layer, will not remove if it's last layer
   */
  public removeTopLayer() {
    this.removeLayerAt((this.layers.length - 1) as Index);
  }

  public contains(position: Vector2 | WeakVector2) {
    const spritePosition = this.transform.position;
    const isInXBounds =
      position.x >= spritePosition.x - this.rect.width * this.rect.x &&
      position.x < spritePosition.x + this.rect.width - this.rect.width * this.rect.x;
    const isInYBounds =
      position.y >= spritePosition.y - this.rect.height * this.rect.y &&
      position.y < spritePosition.y + this.rect.height - this.rect.height * this.rect.y;
    return isInXBounds && isInYBounds;
  }

  /**
   * Called by the renderer to update flattened data on marked dirty
   */
  public updateFlattenedData() {
    // ~ temporary code, add color utils for proper copying of layers
    const spriteSize = this.flattenedData.length;
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];

      if (layer.data.length !== spriteSize) {
        throw Error(
          `Layer ${i} data length (${layer.data.length}) does not match expected sprite size (${spriteSize}) for sprite ID ${this.id}.`
        );
      }

      for (let i = 0; i < spriteSize; i++) {
        this.flattenedData[i] = layer.data[i];
      }
    }

    // Unmark
    this.isFlattendedDataDirty = false;
  }

  /**
   * Updates the sprite's model matrix based on its current transform and rect
   */
  public updateModelMatrix() {
    const modelMatrix = this.modelMatrix;
    const transform = this.transform;
    const rect = this.rect;

    // Pivot offsets (normalized 0–1)
    const pivotOffsetX = rect.x;
    const pivotOffsetY = rect.y;

    // Combine sprite pixel size with world scale
    const scaleX = rect.width * transform.scale.x;
    const scaleY = rect.height * transform.scale.y;

    // Apply Translate -> Rotate -> Scale -> Pivot
    modelMatrix.identity();
    modelMatrix.translateXY(transform.position.x, transform.position.y);

    // ~ todo: quaternion에서 Z축 rad 값 가져오는 함수 만들어야 함
    // modelMatrix.rotateZ(...);

    modelMatrix.scaleXY(scaleX, scaleY);

    // Apply pivot offset in local space
    modelMatrix.translateXY(-pivotOffsetX, -pivotOffsetY);

    // Unmark
    this.isMatrixDirty = false;
  }
}
