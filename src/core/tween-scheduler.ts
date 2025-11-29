interface Task {
  elapsed: number;
}

class TweenTask<TPayload> implements Task {
  public elapsed = 0;
  public duration: number;
  public updateFn: (t: number, payload?: TPayload) => void;
  public payload: TPayload;

  constructor(duration: number, updateFn: (t: number, payload?: TPayload) => void, payload: TPayload) {
    this.duration = duration;
    this.updateFn = updateFn;
    this.payload = payload;
  }
}

class TimerTask<TPayload> implements Task {
  public elapsed = 0;
  public delay: number;
  public callbacc: (payload?: TPayload) => void;
  public payload: TPayload;

  constructor(delay: number, callbacc: (payload?: TPayload) => void, payload: TPayload) {
    this.delay = delay;
    this.callbacc = callbacc;
    this.payload = payload;
  }
}

export class TweenScheduler {
  private activeTweens: Map<object, Map<string, TweenTask<any>>> = new Map();

  public update(dt: number) {
    // Update all tweens
    for (const [owner, tweens] of this.activeTweens) {
      for (const [name, tween] of tweens) {
        tween.elapsed += dt;
        const t = Math.min(tween.elapsed / tween.duration, 1);
        tween.updateFn(t, tween.payload);
        if (t >= 1) tweens.delete(name);
      }

      // Remove owner if no tweens remain
      // if (tweens.size === 0) {
      //   this.activeTweens.delete(owner);
      // }
    }

    // Update all schedules
    // ! todo: ..
  }

  public tween<T>(owner: object, name: string, duration: number, fn: (t: number, payload?: T) => void, payLoad?: T): boolean {
    // Register this owner
    if (!this.activeTweens.has(owner)) {
      this.activeTweens.set(owner, new Map());
    }

    // Check if the tween already exist
    if (this.activeTweens.get(owner)!.has(name)) {
      return false;
    }

    // Create a new tween task for this owner
    const newTween = new TweenTask<typeof payLoad>(duration, fn, payLoad);
    this.activeTweens.get(owner)!.set(name, newTween);

    console.log("!!!");

    // New tween task was added
    return true;
  }

  public removeTween(owner: object, name: string): boolean {
    const tweens = this.activeTweens.get(owner);
    if (tweens && tweens.has(name)) {
      tweens.delete(name);

      // Remove owner if no tweens remain
      if (tweens.size === 0) {
        this.activeTweens.delete(owner);
      }

      // Tween was successfully removed
      return true;
    }

    // No tween found :(
    return false;
  }
}
