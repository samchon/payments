import { ArrayUtil, TestValidator } from "@nestia/e2e";
import toss from "toss-payments-server-api";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { sleep_for } from "tstl";
import typia from "typia";

import { FakeTossStorage } from "../../../src/providers/FakeTossStorage";
import { TestConnection } from "../../internal/TestConnection";

export const validate_fake_payment_cancel_partial =
  (generator: () => Promise<ITossPayment>, virtual: boolean) => async () => {
    // 결제 완료
    const init: ITossPayment = await generator();

    // 검증 로직 준비
    const validate = (count: number) => (p: ITossPayment) => {
      const expected: number = (p.totalAmount / 5) * count;

      // VALIDATE CANCELLED AMOUNT
      TestValidator.equals("balanceAmount")(p.totalAmount - expected)(
        p.balanceAmount,
      );
      TestValidator.equals("cancelAmount")(
        (p.cancels ?? []).map((c) => c.cancelAmount).reduce((a, b) => a + b, 0),
      )(expected);
      TestValidator.equals("cancels?.length")(count)(p.cancels?.length ?? 0);

      // VALIDATE WEBHOOOK
      if (count !== 0) {
        const webhook = FakeTossStorage.webhooks.get(p.paymentKey);
        TestValidator.equals("status")(webhook.data.status)(
          count !== 5 ? "PARTIAL_CANCELED" : "CANCELED",
        );
      }
    };

    // 결제 취소 전 검증
    await sleep_for(100);
    validate(0)(init);

    // 5 회에 걸쳐 분할 취소 하기
    await ArrayUtil.asyncRepeat(5)(async (i) => {
      const cancelled: ITossPayment = await toss.functional.v1.payments.cancel(
        TestConnection.FAKE,
        init.paymentKey,
        {
          paymentKey: init.paymentKey,
          cancelReason: "테스트 결제 취소",
          cancelAmount: init.totalAmount / 5,
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
      await sleep_for(100);
      validate(i + 1)(cancelled);
    });
  };
