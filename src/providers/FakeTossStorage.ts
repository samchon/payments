import { ITossBilling } from "../api/structures/ITossBilling";
import { ITossPayment } from "../api/structures/ITossPayment";
import { ITossPaymentWebhook } from "../api/structures/ITossPaymentWebhook";

import { Configuration } from "../Configuration";
import { VolatileMap } from "../utils/VolatileMap";

export namespace FakeTossStorage
{
    export const payments: VolatileMap<string, ITossPayment> = new VolatileMap(Configuration.EXPIRATION);
    export const billings: VolatileMap<string, [ITossBilling, ITossBilling.IStore]> = new VolatileMap(Configuration.EXPIRATION);
    export const webhooks: VolatileMap<string, ITossPaymentWebhook> = new VolatileMap(Configuration.EXPIRATION);
}