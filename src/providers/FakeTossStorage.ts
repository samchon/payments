import { ITossBilling } from "../api/structures/ITossBilling";
import { ITossCashReceipt } from "../api/structures/ITossCashReceipt";
import { ITossPayment } from "../api/structures/ITossPayment";
import { ITossPaymentWebhook } from "../api/structures/ITossPaymentWebhook";

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
