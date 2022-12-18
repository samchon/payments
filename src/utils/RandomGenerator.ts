import { randint } from "tstl/algorithm/random";
import { sample as _Sample } from "tstl/ranges/algorithm/random";

import { ArrayUtil } from "./ArrayUtil";

export namespace RandomGenerator {
    export function name(length: number = 3): string {
        return new Array(length)
            .fill("")
            .map(() => String.fromCharCode(randint(44031, 55203)))
            .join("");
    }

    export function date(from: Date, range: number): Date {
        const time: number = from.getTime() + randint(0, range);
        return new Date(time);
    }

    export function mobile(): string {
        return `8210${digit(3, 4)}${digit(4, 4)}`;
    }

    export function digit(minC: number, maxC: number): string {
        const val: number = randint(0, Math.pow(10.0, maxC) - 1);
        const log10: number = val ? Math.floor(Math.log10(val)) + 1 : 0;
        const prefix: string = "0".repeat(Math.max(0, minC - log10));

        return prefix + val.toString();
    }

    export function cardNumber(): string {
        return ArrayUtil.repeat(4, () => digit(1, 4)).join("");
    }
}
