import { ITossPaymentWebhook } from "../api/structures/ITossPaymentWebhook";
import { TossFakeConfiguration } from "../FakeTossConfiguration";

// POLYFILL FOR NODE
if (
    typeof global === "object" &&
    typeof global.process === "object" &&
    typeof global.process.versions === "object" &&
    typeof global.process.versions.node !== undefined
)
    (global as any).fetch = require("node-fetch");

export namespace FakeTossWebhookProvider {
    export async function webhook(input: ITossPaymentWebhook): Promise<void> {
        await fetch(TossFakeConfiguration.WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        });
    }
}
