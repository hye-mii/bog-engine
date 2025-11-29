import type { BlendMode, Index, Normalized, SpriteId, UInt } from "../types";
import { generateHashedId } from "../utils/math";
import { Matrix4 } from "../utils/matrix-4";
import { Layer } from "./layer";
import { Modifier } from "./modifier";
import { Rect } from "./rect";
import { Transform2D } from "./transform-2d";

export class Sprite {
  public readonly id: SpriteId;
  public readonly name: string;
  public readonly transform: Transform2D;
  public readonly rect: Rect;
  public isDirty: boolean = false;

  // Data
  private layers: Layer[] = [];
  private modifiers: Modifier[] = [];
  public modelMatrix = new Matrix4();

  // Properties
  private activeLayerIndex: number = 0;
  private opacity: number = 1;
  private visible: boolean = true;
  private zIndex: number = 0;

  constructor(width: UInt, height: UInt) {
    this.id = generateHashedId(6) as SpriteId;
    this.name = `Sprite_${this.id}`;
    this.transform = new Transform2D();
    this.transform.scale.x = 50;
    this.transform.scale.y = 50;
    this.rect = new Rect(0 as Normalized, 0 as Normalized, width, height);

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
  }

  public get activeLayer() {
    return this.layers[this.activeLayerIndex];
  }

  public setPosition(newX: number, newY: number) {
    this.transform.position.x = newX;
    this.transform.position.y = newY;
    this.updateModelMatrix();
    this.isDirty = true;
  }

  public updateModelMatrix() {
    this.modelMatrix.identity();
    this.modelMatrix.translateXY(this.transform.position.x, this.transform.position.y);
    this.modelMatrix.rotateZ(this.transform.rotation);
    this.modelMatrix.scale(this.transform.scale.x, this.transform.scale.y, 1);
  }

  public addLayer(blendMode: BlendMode, setActive: boolean = true) {
    const newLayer = new Layer(this.rect.width as UInt, this.rect.height as UInt, blendMode);
    this.layers.push(newLayer);

    // Set this layer as active
    if (setActive) {
      this.activeLayerIndex = this.layers.length - 1;
    }
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
  }

  public removeLastLayer() {
    this.removeLayerAt((this.layers.length - 1) as Index);
  }
}
