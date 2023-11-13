import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { ITossPaymentWebhook } from "toss-payments-server-api/lib/structures/ITossPaymentWebhook";

import { PaymentWebhookProvider } from "../../providers/payments/PaymentWebhookProvider";
import { IamportPaymentService } from "../../services/iamport/IamportPaymentService";
import { TossPaymentService } from "../../services/toss/TossPaymentService";

@Controller("payments/webhooks")
export class PaymentWebhooksController {
  /**
   * @danger
   */
  @core.TypedRoute.Post("iamport")
  public async iamport(
    @core.TypedBody() input: IIamportPayment.IWebhook,
  ): Promise<void> {
    await PaymentWebhookProvider.process("iamport")<
      IIamportPayment.IWebhook,
      IIamportPayment
    >({
      uid: (input) =>
        input.status !== "ready" && input.status !== "failed"
          ? input.imp_uid
          : null,
      fetch: (history) =>
        IamportPaymentService.at(history.vendor_store_id, history.vendor_uid),
      props: IamportPaymentService.parse,
    })(input);
  }

  /**
   * @internal
   */
  @core.TypedRoute.Post("toss")
  public async toss(
    @core.TypedBody() input: ITossPaymentWebhook,
  ): Promise<void> {
    await PaymentWebhookProvider.process("toss.payments")<
      ITossPaymentWebhook,
      ITossPayment
    >({
      uid: (input) =>
        input.data.status !== "WAITING_FOR_DEPOSIT"
          ? input.data.paymentKey
          : null,
      fetch: (history) =>
        TossPaymentService.at(history.vendor_store_id, history.vendor_uid),
      props: TossPaymentService.parse,
    })(input);
  }
}
