import { ArrayUtil, TestValidator } from "@nestia/e2e";
import PaymentAPI from "@samchon/payment-api/lib/index";
import { IPaymentCancelHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentCancelHistory";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";
import { IPaymentWebhookHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentWebhookHistory";

import { FakePaymentStorage } from "../../../src/providers/payments/FakePaymentStorage";

export const validate_payment_cancel_partial = async (
    connection: PaymentAPI.IConnection,
    history: IPaymentHistory,
    banker: () => IPaymentCancelHistory.IBankAccount | null,
): Promise<void> => {
    // 검증기 준비
    const validate =
        (count: number) => async (record: IPaymentWebhookHistory.IHistory) => {
            const check = (record: IPaymentWebhookHistory.IHistory) => {
                TestValidator.equals("cancelled_at")(!!count)(
                    !!record.cancelled_at,
                );

                if (count !== record.cancels.length)
                    console.log("cancels.length", count, record.cancels.length);
                TestValidator.equals("cancels.length")(count)(
                    record.cancels.length,
                );
                if (
                    (history.price / 5) * count !==
                    record.cancels
                        .map((c) => c.price)
                        .reduce((a, b) => a + b, 0)
                )
                    console.log(
                        "cancels[].amount",
                        (history.price / 5) * count,
                        record.cancels
                            .map((c) => c.price)
                            .reduce((a, b) => a + b, 0),
                        (history.price / 5) * count -
                            record.cancels
                                .map((c) => c.price)
                                .reduce((a, b) => a + b, 0),
                    );
                TestValidator.equals("cancels[].amount")(
                    (history.price / 5) * count,
                )(
                    record.cancels
                        .map((c) => c.price)
                        .reduce((a, b) => a + b, 0),
                );
                TestValidator.equals("history.refund")(record.refund ?? 0)(
                    (history.price / 5) * count,
                );
            };
            check(record);

            if (count !== 0) {
                check(FakePaymentStorage.webhooks.back().current);
                FakePaymentStorage.webhooks.pop_back();
            }
        };
    await validate(0)(history);

    // 결제 취소하기
    await ArrayUtil.asyncRepeat(5)(async (i) => {
        const cancelled: IPaymentHistory =
            await PaymentAPI.functional.payments.histories.cancel(connection, {
                source: history.source,
                password: "some-password",
                price: history.price / 5,
                reason: "some-reason",
                account: banker(),
            });
        await validate(i + 1)(cancelled);
    });
};
