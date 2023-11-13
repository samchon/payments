import PaymentAPI from "@samchon/payment-api/lib/index";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";

import { validate_payment_cancel_partial } from "../internal/validate_payment_cancel_partial";
import { test_api_toss_card_payment } from "./test_api_toss_card_payment";

export async function test_api_toss_card_payment_cancel_partial(
  connection: PaymentAPI.IConnection,
): Promise<void> {
  // 카드 결제하기
  const history: IPaymentHistory = await test_api_toss_card_payment(connection);
  await validate_payment_cancel_partial(connection, history, () => null);
}
