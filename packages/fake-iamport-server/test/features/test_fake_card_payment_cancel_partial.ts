import { ArrayUtil, TestValidator } from "@nestia/e2e";
import imp from "iamport-server-api";
import { IIamportCardPayment } from "iamport-server-api/lib/structures/IIamportCardPayment";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";

import { FakeIamportStorage } from "../../src/providers/FakeIamportStorage";
import { test_fake_card_payment } from "./test_fake_card_payment";

export async function test_fake_card_payment_cancel_partial(
    connector: imp.IamportConnector,
): Promise<void> {
    // 카드 결제하기
    const payment: IIamportCardPayment = await test_fake_card_payment(
        connector,
    );

    // 검증 로직 준비
    const validate =
        (count: number) =>
        async (p: IIamportPayment): Promise<void> => {
            // VALIDATE CANCELLED AMOUNT
            const expected: number = (payment.amount / 5) * count;
            TestValidator.equals("cancel_amount")(p.cancel_amount)(expected);
            TestValidator.predicate("cancelled_at")(
                () => !!p.cancelled_at === !!count,
            );
            TestValidator.predicate("cancel_history")(
                () =>
                    p.cancel_history.length === count &&
                    p.cancel_history
                        .map((h) => h.amount)
                        .reduce((a, b) => a + b, 0) === expected,
            );
            if (count === 0) return;

            // VALIDATE WEBHOOK
            const webhook: IIamportPayment.IWebhook =
                FakeIamportStorage.webhooks.back();
            TestValidator.equals("webhook.imp_uid")(webhook.imp_uid)(
                payment.imp_uid,
            );
            TestValidator.equals("webhook.merchant_uid")(webhook.merchant_uid);
            TestValidator.equals("webhook.status")(webhook.status)("cancelled");
        };
    validate(0)(payment);

    // 5 회에 걸쳐 분할 취소 하기
    await ArrayUtil.asyncRepeat(5)(async (i) => {
        const reply: IIamportResponse<IIamportPayment> =
            await imp.functional.payments.cancel(await connector.get(), {
                imp_uid: payment.imp_uid,
                merchant_uid: payment.merchant_uid,
                amount: payment.amount / 5,
                checksum: payment.amount - (payment.amount * i) / 5,
                reason: `테스트 결제 취소 ${i}`,
            });
        await validate(i + 1)(reply.response);
    });
}
