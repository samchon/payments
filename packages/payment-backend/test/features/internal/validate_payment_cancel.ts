import { TestValidator } from "@nestia/e2e";
import PaymentAPI from "@samchon/payment-api/lib/index";
import { IPaymentCancelHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentCancelHistory";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";
import { IPaymentWebhookHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentWebhookHistory";
import { sleep_for } from "tstl";

import { FakePaymentStorage } from "../../../src/providers/payments/FakePaymentStorage";

export const validate_payment_cancel = async (
    connection: PaymentAPI.IConnection,
    history: IPaymentHistory,
    banker: () => IPaymentCancelHistory.IBankAccount | null,
) => {
    // 검증기 준비
    const validate =
        (done: boolean) => (record: IPaymentWebhookHistory.IHistory) => {
            TestValidator.equals("cancelled_at")(done)(!!record.cancelled_at);
            TestValidator.equals("cancels.length")(done)(
                !!record.cancels.length,
            );
            TestValidator.equals("cancels[0].amount")(done ? history.price : 0)(
                done ? record.cancels[0].price : 0,
            );
            TestValidator.equals("history.refund")(record.refund)(
                done ? history.price : null,
            );
        };
    validate(false)(history);

    // 결제 취소하기
    const cancelled: IPaymentHistory =
        await PaymentAPI.functional.payments.histories.cancel(connection, {
            source: history.source,
            password: "some-password",
            price: history.price,
            reason: "some-reason",
            account: banker(),
        });
    validate(true)(cancelled);

    // 웹훅 검증하기
    await sleep_for(1000);
    const webhook: IPaymentWebhookHistory | undefined =
        FakePaymentStorage.webhooks.back();
    if (webhook === undefined) throw new Error("Webhook history not found.");
    validate(true)(webhook.current);
    FakePaymentStorage.webhooks.pop_back();

    // 데이터 불러와 재확인
    const reloaded: IPaymentHistory =
        await PaymentAPI.functional.payments.histories.at(
            connection,
            history.id,
            {
                password: "some-password",
            },
        );
    validate(true)(reloaded);
};
