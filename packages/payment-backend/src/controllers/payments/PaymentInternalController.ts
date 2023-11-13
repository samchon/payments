import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { IPaymentWebhookHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentWebhookHistory";

import { FakePaymentStorage } from "../../providers/payments/FakePaymentStorage";

@Controller("payments/internal")
export class PaymentInternalController {
  /**
   * @internal
   */
  @core.EncryptedRoute.Post("webhook")
  public webhook(@core.EncryptedBody() input: IPaymentWebhookHistory): void {
    FakePaymentStorage.webhooks.push_back(input);
  }
}
