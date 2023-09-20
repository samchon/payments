import { ITossBilling } from "toss-payments-server-api/lib/structures/ITossBilling";
import { ITossCashReceipt } from "toss-payments-server-api/lib/structures/ITossCashReceipt";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { ITossPaymentWebhook } from "toss-payments-server-api/lib/structures/ITossPaymentWebhook";

import { TossFakeConfiguration } from "../FakeTossConfiguration";
import { VolatileMap } from "../utils/VolatileMap";

export namespace FakeTossStorage {
    export const payments: VolatileMap<string, ITossPayment> = new VolatileMap(
        TossFakeConfiguration.EXPIRATION,
    );
    export const billings: VolatileMap<
        string,
        [ITossBilling, ITossBilling.IStore]
    > = new VolatileMap(TossFakeConfiguration.EXPIRATION);
    export const cash_receipts: VolatileMap<string, ITossCashReceipt> =
        new VolatileMap(TossFakeConfiguration.EXPIRATION);
    export const webhooks: VolatileMap<string, ITossPaymentWebhook> =
        new VolatileMap(TossFakeConfiguration.EXPIRATION);
}
