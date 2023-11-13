import { TestValidator } from "@nestia/e2e";
import toss from "toss-payments-server-api";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import typia from "typia";

import { TestConnection } from "../../internal/TestConnection";

export const validate_fake_payment_cancel_over =
  (generator: () => Promise<ITossPayment>, virtual: boolean) => async () => {
    // 결제 완료
    const payment: ITossPayment = await generator();

    // 결제 취소하기 (전액 + 100)
    await TestValidator.error("over")(() =>
      toss.functional.v1.payments.cancel(
        TestConnection.FAKE,
        payment.paymentKey,
        {
          paymentKey: payment.paymentKey,
          cancelReason: "테스트 결제 취소",
          cancelAmount: payment.totalAmount + 100,
          refundReceiveAccount: virtual
            ? {
                bank: "국민은행",
                accountNumber: "12345678901234",
                holderName: "홍길동",
              }
            : undefined,
        },
      ),
    );

    // 결제 내역 재 조회하여 다시 검증
    const reloaded: ITossPayment = await toss.functional.v1.payments.at(
      TestConnection.FAKE,
      payment.paymentKey,
    );
    typia.assert(reloaded);
    TestValidator.equals("balance")(payment.balanceAmount)(payment.totalAmount);
    TestValidator.equals("cancels.length")(payment.cancels?.length ?? 0)(0);
  };
