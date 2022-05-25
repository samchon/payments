import { randint } from "tstl/algorithm/random";
import { assertType } from "typescript-is";
import { v4 } from "uuid";

import toss from "../../../api";
import { ITossBilling } from "../../../api/structures/ITossBilling";
import { ITossPayment } from "../../../api/structures/ITossPayment";

import { TestConnection } from "../../internal/TestConnection";
import { FakeTossStorage } from "../../../providers/FakeTossStorage";
import { RandomGenerator } from "../../../utils/RandomGenerator";
import { exception_must_be_thrown } from "../../internal/exception_must_be_thrown";
import { TossFakeConfiguration } from "../../../FakeTossConfiguration";

export async function test_storage_capacity(): Promise<void> {
    let capacity: number = TossFakeConfiguration.EXPIRATION.capacity;

    FakeTossStorage.payments.clear();
    FakeTossStorage.billings.clear();
    TossFakeConfiguration.EXPIRATION.capacity = 1;

    let previous: string | null = null;
    for (let i: number = 0; i < 10; ++i) {
        // GENERATE RANDOM BILLING
        const customerKey: string = v4();
        const billing: ITossBilling =
            await toss.functional.v1.billing.authorizations.card.store(
                TestConnection.FAKE,
                {
                    customerKey,
                    customerBirthday: "880311",
                    cardNumber: RandomGenerator.cardNumber(),
                    cardExpirationYear: randint(2022, 2028).toString(),
                    cardExpirationMonth: randint(1, 12).toString(),
                    cardPassword: RandomGenerator.digit(1, 4),
                },
            );
        assertType<typeof billing>(billing);

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
        assertType<typeof payment>(payment);

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
        if (previous !== null)
            await exception_must_be_thrown(
                "VirtualTossStorage.payments.get() for expired record",
                () =>
                    toss.functional.v1.payments.at(
                        TestConnection.FAKE,
                        previous!,
                    ),
            );
        await toss.functional.v1.payments.at(
            TestConnection.FAKE,
            payment.paymentKey,
        );
        previous = payment.paymentKey;
    }

    TossFakeConfiguration.EXPIRATION.capacity = capacity;
}
