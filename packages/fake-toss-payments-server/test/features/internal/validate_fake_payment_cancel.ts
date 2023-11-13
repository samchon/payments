import { TestValidator } from "@nestia/e2e";
import toss from "toss-payments-server-api";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { ITossPaymentWebhook } from "toss-payments-server-api/lib/structures/ITossPaymentWebhook";
import { sleep_for } from "tstl";
import typia from "typia";

import { FakeTossStorage } from "../../../src/providers/FakeTossStorage";
import { TestConnection } from "../../internal/TestConnection";

export const validate_fake_payment_cancel =
  (generator: () => Promise<ITossPayment>, virtual: boolean) => async () => {
    // 결제 완료
    const init: ITossPayment = await generator();

    // 검증 로직 준비
    const validate = (cancelled: boolean) => (p: ITossPayment) => {
      TestValidator.equals("balanceAmount")(cancelled ? 0 : p.totalAmount)(
        p.balanceAmount,
      );
      TestValidator.equals("cancelAmount")(
        (p.cancels ?? []).map((c) => c.cancelAmount).reduce((a, b) => a + b, 0),
      )(cancelled ? p.totalAmount : 0);
      TestValidator.equals("cancels?.length")(cancelled ? 1 : 0)(
        p.cancels?.length ?? 0,
      );
      TestValidator.predicate("cancel_history")(
        cancelled
          ? () =>
              p.cancels?.length === 1 &&
              p.cancels?.[0].cancelAmount === p.totalAmount
          : () => !p.cancels?.length,
      );
    };

    // 결제 취소 전 검증
    validate(false)(init);

    // 결제 취소하기 (전액)
    const cancelled: ITossPayment = await toss.functional.v1.payments.cancel(
      TestConnection.FAKE,
      init.paymentKey,
      {
        paymentKey: init.paymentKey,
        cancelReason: "테스트 결제 취소",
        cancelAmount: init.totalAmount,
        refundReceiveAccount: virtual
          ? {
              bank: "국민은행",
              accountNumber: "12345678901234",
              holderName: "홍길동",
            }
          : undefined,
      },
    );
    typia.assert(cancelled);
    validate(true)(cancelled);

    // 웹훅 검증
    await sleep_for(50);
    const webhook: ITossPaymentWebhook = FakeTossStorage.webhooks.get(
      init.paymentKey,
    );
    TestValidator.equals("status")(webhook.data.status)("CANCELED");

    // 결제 내역 재 조회하여 검증
    const reloaded: ITossPayment = await toss.functional.v1.payments.at(
      TestConnection.FAKE,
      init.paymentKey,
    );
    typia.assert(reloaded);
    validate(true)(reloaded);
  };
