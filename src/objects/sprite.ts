import type { BlendMode, Index, Normalized, PixelDataRGBA, SpriteId, UInt } from "../types";
import { generateHashedId } from "../utils/math";
import { Matrix4 } from "../utils/matrix-4";
import type { Vector2 } from "../utils/vector-2";
import { Layer } from "./layer";
import { Modifier } from "./modifier";
import { Rect } from "./rect";
import { Transform } from "./transform";

export class Sprite {
  public readonly id: SpriteId;
  public readonly name: string;
  public readonly transform: Transform = new Transform();
  public readonly rect: Rect;
  public isDirty: boolean = false;
  public modelMatrix = new Matrix4();

  // Data
  public readonly flattenedData: PixelDataRGBA;
  private layers: Layer[] = [];
  private modifiers: Modifier[] = [];

  // Properties
  private activeLayerIndex: number = 0;
  private opacity: number = 1;
  private visible: boolean = true;
  public zIndex: number = 0;

  constructor(width: UInt, height: UInt, x: number, y: number) {
    this.id = generateHashedId(6) as SpriteId;
    this.name = `Sprite_${this.id}`;
    this.rect = new Rect(0.5, 0.5, width, height);
    this.flattenedData = new Uint8Array(width * height * 4) as PixelDataRGBA;
    this.transform.position.x = x;
    this.transform.position.y = y;

    // Create default layer
    const defaultLayer = new Layer(width, height, "normal");
    defaultLayer.fill({ r: 255, g: 255, b: 255, a: 255 });

    // ! temp: ..
    defaultLayer.data = new Uint8ClampedArray([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 15, 62, 53, 255, 15, 62, 53, 255, 15, 62, 53, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 62, 53, 255, 51, 234, 204, 255, 43, 200, 172,
      255, 15, 62, 53, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 15, 62, 53, 255, 51, 234, 204, 255, 43, 200, 172, 255, 51, 234, 204, 255, 15, 62, 53, 255, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 62, 53, 255, 51, 234, 204, 255,
      43, 200, 172, 255, 51, 234, 204, 255, 15, 62, 53, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 62, 53, 255, 51, 234, 204, 255, 43, 200, 172, 255, 51, 234, 204, 255, 15, 62, 53, 255,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 62, 53,
      255, 51, 234, 204, 255, 43, 200, 172, 255, 51, 234, 204, 255, 15, 62, 53, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 7, 38, 32, 255, 7, 38, 32, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 62, 53, 255, 51, 234, 204, 255, 43, 200, 172, 255, 51,
      234, 204, 255, 15, 62, 53, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 38, 32, 255, 22, 99, 87,
      255, 7, 38, 32, 255, 0, 0, 0, 0, 15, 62, 53, 255, 51, 234, 204, 255, 43, 200, 172, 255, 51, 234, 204, 255, 15, 62, 53, 255, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 38, 32, 255, 32, 137, 120, 255, 7, 38, 32,
      255, 51, 234, 204, 255, 43, 200, 172, 255, 51, 234, 204, 255, 15, 62, 53, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 38, 32, 255, 32, 137, 120, 255, 7, 38, 32, 255, 43, 200, 172, 255, 51, 234,
      204, 255, 15, 62, 53, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 7, 38, 32, 255, 32, 137, 120, 255, 7, 38, 32, 255, 7, 38, 32, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 75, 53, 22, 255, 104, 78, 30, 255, 7, 38,
      32, 255, 32, 137, 120, 255, 22, 99, 87, 255, 7, 38, 32, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 75, 53, 22, 255, 135, 104, 39, 255, 37, 29, 11, 255, 0, 0, 0, 0, 7, 38, 32, 255, 7, 38, 32, 255,
      22, 99, 87, 255, 7, 38, 32, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 38, 32, 255, 7, 38, 32,
      255, 104, 78, 30, 255, 37, 29, 11, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 38, 32, 255, 7, 38, 32, 255, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 38, 32, 255, 32, 137, 120, 255, 7, 38, 32, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7,
      38, 32, 255, 7, 38, 32, 255, 7, 38, 32, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);

    this.layers.push(defaultLayer);

    this.updateModelMatrix();
    this.updateFlattenedData();
  }

  public updateFlattenedData() {
    const spriteSize = this.flattenedData.length;

    this.layers.forEach((layer) => {
      if (layer.data.length !== spriteSize) {
        throw Error(`Error parsing data from layer to sprite of sprite id:${this.id}`);
      }

      for (let i = 0; i < spriteSize; i++) {
        this.flattenedData[i] = layer.data[i];
      }
    });
  }

  public setPosition(newX: number, newY: number) {
    this.transform.position.x = newX;
    this.transform.position.y = newY;
    this.updateModelMatrix();
    this.isDirty = true;
  }

  public updateModelMatrix() {
    const modelMatrix = this.modelMatrix;
    const transform = this.transform;
    const rect = this.rect;

    // Pivot offset x, and y are normalised ( 0 to 1 )
    const pivotOffsetX = rect.x;
    const pivotOffsetY = rect.y;

    // World screen scaling
    const scaleX = rect.width * transform.scale.x;
    const scaleY = rect.height * transform.scale.y;

    // Apply Translate -> Rotate -> Scale -> Pivot
    modelMatrix.identity();
    modelMatrix.translateXY(transform.position.x + transform.pivot.x, transform.position.y + transform.pivot.y);

    // ~ quaternion에서 Z축 rad 값 가져오는 함수 만들어야 함
    // modelMatrix.rotateZ(...);

    modelMatrix.scaleXY(scaleX, scaleY);
    modelMatrix.translateXY(-pivotOffsetX, -pivotOffsetY);
  }

  public addLayer(blendMode: BlendMode, setActive: boolean = true) {
    const newLayer = new Layer(this.rect.width as UInt, this.rect.height as UInt, blendMode);
    this.layers.push(newLayer);

    // Set this layer as active
    if (setActive) {
      this.activeLayerIndex = this.layers.length - 1;
    }

    // Recalculate sprite's flattened data
    this.updateFlattenedData();
  }

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
    this.updateFlattenedData();
  }

  public removeLastLayer() {
    this.removeLayerAt((this.layers.length - 1) as Index);
  }

  public contains(position: Vector2) {
    const spritePosition = this.transform.position;
    const isInXBounds = position.x >= spritePosition.x && position.x < spritePosition.x + this.rect.width;
    const isInYBounds = position.y >= spritePosition.y && position.y < spritePosition.y + this.rect.height;
    return isInXBounds && isInYBounds;
  }
}
