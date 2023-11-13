import { HashMap } from "tstl/container/HashMap";
import { TreeMap } from "tstl/container/TreeMap";
import { equal_to } from "tstl/functional/comparators";
import { hash } from "tstl/functional/hash";

export class VolatileMap<Key, T> {
  private readonly dict_: HashMap<Key, T>;
  private readonly timepoints_: TreeMap<number, Key>;

  public constructor(
    public readonly expiration: VolatileMap.IExpiration,
    hasher: (key: Key) => number = hash,
    pred: (x: Key, y: Key) => boolean = equal_to,
  ) {
    this.dict_ = new HashMap(hasher, pred);
    this.timepoints_ = new TreeMap();
  }

  public size(): number {
    return this.dict_.size();
  }

  public get(key: Key): T {
    return this.dict_.get(key);
  }

  public clear(): void {
    this.dict_.clear();
    this.timepoints_.clear();
  }

  public set(key: Key, value: T): void {
    this._Clean_up();

    this.dict_.set(key, value);
    this.timepoints_.set(Date.now(), key);
  }

  private _Clean_up(): void {
    const bound: number = Date.now() - this.expiration.time;
    const last: TreeMap.Iterator<number, Key> =
      this.timepoints_.upper_bound(bound);

    for (let it = this.timepoints_.begin(); it.equals(last) === false; ) {
      this.dict_.erase(it.second);
      it = this.timepoints_.erase(it);
    }
    if (this.timepoints_.size() < this.expiration.capacity) return;

    let left: number = this.timepoints_.size() - this.expiration.capacity;
    while (left-- === 0) {
      const it: TreeMap.Iterator<number, Key> = this.timepoints_.begin();
      this.dict_.erase(it.second);
      this.timepoints_.erase(it);
    }
  }
}
export namespace VolatileMap {
  export interface IExpiration {
    time: number;
    capacity: number;
  }
}
