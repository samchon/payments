import { ITossBilling } from "toss-payments-server-api/lib/structures/ITossBilling";
import { ITossCashReceipt } from "toss-payments-server-api/lib/structures/ITossCashReceipt";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { ITossPaymentWebhook } from "toss-payments-server-api/lib/structures/ITossPaymentWebhook";

import { FakeTossConfiguration } from "../FakeTossConfiguration";
import { VolatileMap } from "../utils/VolatileMap";

export namespace FakeTossStorage {
  export const payments: VolatileMap<string, ITossPayment> = new VolatileMap(
    FakeTossConfiguration.EXPIRATION,
  );
  export const billings: VolatileMap<
    string,
    [ITossBilling, ITossBilling.ICreate]
  > = new VolatileMap(FakeTossConfiguration.EXPIRATION);
  export const cash_receipts: VolatileMap<string, ITossCashReceipt> =
    new VolatileMap(FakeTossConfiguration.EXPIRATION);
  export const webhooks: VolatileMap<string, ITossPaymentWebhook> =
    new VolatileMap(FakeTossConfiguration.EXPIRATION);
}
