import { TestValidator } from "@nestia/e2e";
import { randint } from "tstl/algorithm/random";
import { IPointer } from "tstl/functional/IPointer";
import { assert } from "typia";
import { v4 } from "uuid";

import { TossFakeConfiguration } from "../../../FakeTossConfiguration";
import toss from "../../../api";
import { ITossBilling } from "../../../api/structures/ITossBilling";
import { ITossPayment } from "../../../api/structures/ITossPayment";
import { FakeTossStorage } from "../../../providers/FakeTossStorage";
import { AdvancedRandomGenerator } from "../../internal/AdvancedRandomGenerator";
import { TestConnection } from "../../internal/TestConnection";

export async function test_storage_capacity(): Promise<void> {
    const capacity: number = TossFakeConfiguration.EXPIRATION.capacity;

    FakeTossStorage.payments.clear();
    FakeTossStorage.billings.clear();
    TossFakeConfiguration.EXPIRATION.capacity = 1;

    const previous: IPointer<string | null> = { value: null };
    for (let i: number = 0; i < 10; ++i) {
        // GENERATE RANDOM BILLING
        const customerKey: string = v4();
        const billing: ITossBilling =
            await toss.functional.v1.billing.authorizations.card.store(
                TestConnection.FAKE,
                {
                    customerKey,
                    customerBirthday: "880311",
                    cardNumber: AdvancedRandomGenerator.cardNumber(),
                    cardExpirationYear: randint(2022, 2028).toString(),
                    cardExpirationMonth: randint(1, 12).toString(),
                    cardPassword: AdvancedRandomGenerator.digit(1, 4),
                },
            );
        assert(billing);

        // GENERATE RANDOM PAYMENT BY THE BILLING
        const orderId: string = v4();
        const amount: number = 100;

        const payment: ITossPayment = await toss.functional.v1.billing.pay(
            TestConnection.FAKE,
            billing.billingKey,
            {
                method: "billing",
                customerKey,
                billingKey: billing.billingKey,
                orderId,
                amount,
            },
        );
        assert(payment);

        // APPROVE THE PAYMENT
        await toss.functional.v1.payments.approve(
            TestConnection.FAKE,
            payment.paymentKey,
            {
                orderId,
                amount,
            },
        );

        // TEST THE EXPIRATION
        if (previous.value !== null)
            await TestValidator.error(
                "VirtualTossStorage.payments.get() for expired record",
            )(() =>
                toss.functional.v1.payments.at(
                    TestConnection.FAKE,
                    previous.value!,
                ),
            );
        await toss.functional.v1.payments.at(
            TestConnection.FAKE,
            payment.paymentKey,
        );
        previous.value = payment.paymentKey;
    }

    TossFakeConfiguration.EXPIRATION.capacity = capacity;
}
