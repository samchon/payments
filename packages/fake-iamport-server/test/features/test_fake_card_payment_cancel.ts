import { TestValidator } from "@nestia/e2e";
import imp from "iamport-server-api";
import { IIamportCardPayment } from "iamport-server-api/lib/structures/IIamportCardPayment";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import typia from "typia";

import { FakeIamportStorage } from "../../src/providers/FakeIamportStorage";
import { test_fake_card_payment } from "./test_fake_card_payment";

export async function test_fake_card_payment_cancel(
    connector: imp.IamportConnector,
): Promise<void> {
    // 카드 결제하기
    const payment: IIamportCardPayment = await test_fake_card_payment(
        connector,
    );

    // 검증 로직 준비
    const validate = (cancelled: boolean) => (p: IIamportPayment) => {
        TestValidator.equals("cancel_amount")(p.cancel_amount)(
            cancelled ? payment.amount : 0,
        );
        TestValidator.predicate("cancelled_at")(
            () => !!p.cancelled_at === cancelled,
        );
        TestValidator.predicate("cancel_history")(
            cancelled
                ? () =>
                      p.cancel_history.length === 1 &&
                      p.cancel_history[0].amount === payment.amount
                : () => p.cancel_history.length === 0,
        );
    };
    validate(false)(payment);

    // 결제 취소하기 (전액)
    const reply: IIamportResponse<IIamportPayment> =
        await imp.functional.payments.cancel(await connector.get(), {
            imp_uid: payment.imp_uid,
            merchant_uid: payment.merchant_uid,
            amount: payment.amount,
            checksum: payment.amount,
            reason: "테스트 결제 취소",
        });

    // 데이터 및 로직 검증
    typia.assert(reply);
    typia.assert<IIamportCardPayment>(reply.response);
    validate(true)(reply.response);

    // 웹훅 검증
    const webhook: IIamportPayment.IWebhook =
        FakeIamportStorage.webhooks.back();
    TestValidator.equals("webhook.imp_uid")(webhook.imp_uid)(payment.imp_uid);
    TestValidator.equals("webhook.merchant_uid")(webhook.merchant_uid);
    TestValidator.equals("webhook.status")(webhook.status)("cancelled");

    // 결제 내역 재 조회하여 다시 검증
    const reloaded: IIamportResponse<IIamportPayment> =
        await imp.functional.payments.at(
            await connector.get(),
            payment.imp_uid,
            {},
        );
    typia.assert(reloaded);
    typia.assert<IIamportCardPayment>(reloaded.response);
    validate(true)(reloaded.response);
}
