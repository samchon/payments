import { TestValidator } from "@nestia/e2e";
import imp from "iamport-server-api";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import { IIamportVBankPayment } from "iamport-server-api/lib/structures/IIamportVBankPayment";
import typia from "typia";

import { test_fake_vbank_payment } from "./test_fake_vbank_payment";

export async function test_fake_vbank_payment_cancel_over(
  connector: imp.IamportConnector,
): Promise<void> {
  // 카드 결제하기
  const payment: IIamportVBankPayment =
    await test_fake_vbank_payment(connector);

  // 결제 취소하기 (전액 + 100)
  await TestValidator.error("over")(async () =>
    imp.functional.payments.cancel(await connector.get(), {
      imp_uid: payment.imp_uid,
      merchant_uid: payment.merchant_uid,
      amount: payment.amount + 100,
      checksum: null,
      reason: "테스트 결제 취소",
    }),
  );

  // 결제 내역 재 조회하여 다시 검증
  const reloaded: IIamportResponse<IIamportPayment> =
    await imp.functional.payments.at(
      await connector.get(),
      payment.imp_uid,
      {},
    );
  typia.assert(reloaded);
  typia.assert<IIamportVBankPayment>(reloaded.response);
  TestValidator.equals("cancel_amount")(reloaded.response.cancel_amount)(0);
}
