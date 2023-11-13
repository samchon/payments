import PaymentAPI from "@samchon/payment-api/lib/index";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";

import { validate_payment_cancel_partial } from "../internal/validate_payment_cancel_partial";
import { test_api_iamport_vbank_payment } from "./test_api_iamport_vbank_payment";

export async function test_api_iamport_vbank_payment_cancel_partial(
  connection: PaymentAPI.IConnection,
): Promise<void> {
  // 카드 결제하기
  const history: IPaymentHistory = await test_api_iamport_vbank_payment(
    connection,
  );
  await validate_payment_cancel_partial(connection, history, () => ({
    bank: "신한은행",
    account: "110-123-456789",
    holder: "홍길동",
    mobile: "010-1234-5678",
  }));
}
