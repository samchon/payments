import { HashMap } from "tstl/container/HashMap";
import { TreeMap } from "tstl/container/TreeMap";
import { OutOfRange } from "tstl/exception/OutOfRange";
import { equal_to } from "tstl/functional/comparators";
import { hash } from "tstl/functional/hash";

export class VolatileMap<Key, T> {
    private readonly dict_: HashMap<Key, T>;
    private readonly timepoints_: TreeMap<number, Key>;

    /* -----------------------------------------------------------
        CONSTRUCTORS
    ----------------------------------------------------------- */
    public constructor(
        public readonly expiration: VolatileMap.IExpiration,
        hasher: (key: Key) => number = hash,
        pred: (x: Key, y: Key) => boolean = equal_to,
    ) {
        this.dict_ = new HashMap(hasher, pred);
        this.timepoints_ = new TreeMap();
    }

    public clear(): void {
        this.dict_.clear();
        this.timepoints_.clear();
    }

    /* -----------------------------------------------------------
        ACCESSORS
    ----------------------------------------------------------- */
    public size(): number {
        return this.dict_.size();
    }

    public get(key: Key): T {
        return this.dict_.get(key);
    }

    public has(key: Key): boolean {
        return this.dict_.has(key);
    }

    public back(): T {
        if (this.size() === 0) throw new OutOfRange("No element exists.");
        return this.dict_.rbegin().second;
    }

    /* -----------------------------------------------------------
        ELEMENTS I/O
    ----------------------------------------------------------- */
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

    public erase(key: Key): number {
        return this.dict_.erase(key);
    }
}
export namespace VolatileMap {
    export interface IExpiration {
        time: number;
        capacity: number;
    }
}
