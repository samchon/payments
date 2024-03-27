import { IPaymentWebhookHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentWebhookHistory";
import { Vector } from "tstl";

export namespace FakePaymentStorage {
  export const webhooks: Vector<IPaymentWebhookHistory> = new Vector();
}
