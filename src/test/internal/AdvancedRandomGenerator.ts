import { RandomGenerator } from "@nestia/e2e";
import { randint } from "tstl/algorithm/random";

export const AdvancedRandomGenerator = {
    ...RandomGenerator,
    name: (length: number = 3) =>
        new Array(length)
            .fill("")
            .map(() => String.fromCharCode(randint(44031, 55203)))
            .join(""),
    cardNumber: () =>
        new Array(4)
            .fill("")
            .map(() => RandomGenerator.digit(1, 4))
            .join(""),
};
