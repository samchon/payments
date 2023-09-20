import { randint } from "tstl";

const CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LETTERS: string = "0123456789" + CHARACTERS;
const alphaNumeric = (length: number) =>
    new Array(length)
        .fill("")
        .map(() => LETTERS[randint(0, LETTERS.length - 1)])
        .join("");

console.log(alphaNumeric(32));
console.log(alphaNumeric(16));
console.log(alphaNumeric(16));
