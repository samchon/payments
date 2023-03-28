import { assert } from "typia";
import { v4 } from "uuid";

import toss from "toss-payments-server-api";
import { ITossBilling } from "toss-payments-server-api/lib/structures/ITossBilling";
import { ITossCardPayment } from "toss-payments-server-api/lib/structures/ITossCardPayment";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";

import { TestConnection } from "../../internal/TestConnection";

export async function test_fake_billing_payment(): Promise<void> {
    // 간편 결제 카드 등록하기
    const billing: ITossBilling =
        await toss.functional.v1.billing.authorizations.card.store(
            TestConnection.FAKE,
            {
                customerKey: "some-consumer-key",
                cardNumber: "1111222233334444",
                cardExpirationYear: "28",
                cardExpirationMonth: "03",
                cardPassword: "99",
                customerBirthday: "880311",
                consumerName: "남정호",
            },
        );
    assert<ITossBilling>(billing);

    // 간편 결제 카드로 결제하기
    const payment: ITossPayment = await toss.functional.v1.billing.pay(
        TestConnection.FAKE,
        billing.billingKey,
        {
            method: "billing",
            billingKey: billing.billingKey,
            customerKey: v4(),
            orderId: v4(),
            amount: 10_000,
        },
    );
    assert<ITossCardPayment>(payment);

    // 간편 결제 카드로 결제시, 별도 승인 처리가 필요 없음
    if (payment.approvedAt === null || payment.status !== "DONE")
        throw new Error(
            "Bug on TossBillingController.pay(): failed to billing pay.",
        );
}
