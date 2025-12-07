import type { EventID, EventMap, EventType } from "../types/event-types";
import { generateUUID } from "../utils/math";

// BUSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS!!!!!!!!!!!!!!!!!!!!!!
export class EventManager {
  private listeners: { [T in EventType]: Map<string, EventMap[T]> } = {
    moveCamera: new Map(),
    zoomCamera: new Map(),
    resizeViewport: new Map(),

    onSpriteAdded: new Map(),
    onSpriteDelete: new Map(),
  };

  // Listen to an event
  public subscribe<T extends EventType>(binder: string, type: T, fn: EventMap[T]): EventID {
    const id = `${binder}_${generateUUID()}`;
    this.listeners[type].set(id, fn);
    return id as EventID;
  }

  // Stop listening to an event
  public unsubscribe<T extends EventType>(type: T, id: EventID): boolean {
    return this.listeners[type].delete(id);
  }

  // Broadcast event
  public fire<T extends EventType>(type: T, ...args: Parameters<EventMap[T]>): void {
    this.listeners[type].forEach((fn) => fn(...args));
  }
}
