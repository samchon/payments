import { ITossPaymentWebhook } from "toss-payments-server-api/lib/structures/ITossPaymentWebhook";

import { FakeTossConfiguration } from "../FakeTossConfiguration";

export namespace FakeTossWebhookProvider {
  export async function webhook(input: ITossPaymentWebhook): Promise<void> {
    await fetch(FakeTossConfiguration.WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  }
}
