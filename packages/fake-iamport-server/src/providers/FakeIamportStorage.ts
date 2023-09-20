import { IIamportCertification } from "iamport-server-api/lib/structures/IIamportCertification";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportReceipt } from "iamport-server-api/lib/structures/IIamportReceipt";
import { IIamportSubscription } from "iamport-server-api/lib/structures/IIamportSubscription";
import { IIamportUser } from "iamport-server-api/lib/structures/IIamportUser";

import { FakeIamportConfiguration } from "../FakeIamportConfiguration";
import { VolatileMap } from "../utils/VolatileMap";

export namespace FakeIamportStorage {
    export const certifications: VolatileMap<string, IIamportCertification> =
        new VolatileMap(FakeIamportConfiguration.STORAGE_EXPIRATION);
    export const payments: VolatileMap<string, IIamportPayment> =
        new VolatileMap(FakeIamportConfiguration.STORAGE_EXPIRATION);
    export const receipts: VolatileMap<string, IIamportReceipt> =
        new VolatileMap(FakeIamportConfiguration.STORAGE_EXPIRATION);
    export const subscriptions: VolatileMap<string, IIamportSubscription> =
        new VolatileMap(FakeIamportConfiguration.STORAGE_EXPIRATION);
    export const users: VolatileMap<string, IIamportUser> = new VolatileMap(
        FakeIamportConfiguration.STORAGE_EXPIRATION,
    );
    export const webhooks: VolatileMap<string, IIamportPayment.IWebhook> =
        new VolatileMap(FakeIamportConfiguration.STORAGE_EXPIRATION);
}
