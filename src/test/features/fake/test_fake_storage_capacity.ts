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
import { Configuration } from "../../../Configuration";

export async function test_virtual_storage_capacity(): Promise<void>
{
    let capacity: number = Configuration.EXPIRATION.capacity;
    
    FakeTossStorage.payments.clear();
    FakeTossStorage.billings.clear();
    Configuration.EXPIRATION.capacity = 1;

    let previous: string | null = null;
    for (let i: number = 0; i < 10; ++i)
    {
        // GENERATE RANDOM BILLING
        const customerKey: string = v4();
        const billing: ITossBilling = await toss.functional.billing.authorizations.card.store
        (
            TestConnection.LOCAL,
            {
                customerKey,
                customerBirthday: "880311",
                cardNumber: RandomGenerator.cardNumber(),
                cardExpirationYear: randint(2022, 2028).toString(),
                cardExpirationMonth: randint(1, 12).toString(),
                cardPassword: RandomGenerator.digit(1, 4),
            }
        );
        assertType<typeof billing>(billing);

        // GENERATE RANDOM PAYMENT BY THE BILLING
        const orderId: string = v4();
        const amount: number = 100;

        const payment: ITossPayment = await toss.functional.billing.pay
        (
            TestConnection.LOCAL,
            billing.billingKey,
            {
                method: "billing",
                customerKey,
                billingKey: billing.billingKey,
                orderId,
                amount
            }
        );
        assertType<typeof payment>(payment);

        // APPROVE THE PAYMENT
        await toss.functional.payments.approve
        (
            TestConnection.LOCAL,
            payment.paymentKey, 
            {
                orderId,
                amount
            }
        );

        // TEST THE EXPIRATION
        if (previous !== null)
            await exception_must_be_thrown
            (
                "VirtualTossStorage.payments.get() for expired record",
                () => toss.functional.payments.at(TestConnection.LOCAL, previous!)
            );
        await toss.functional.payments.at(TestConnection.LOCAL, payment.paymentKey);
        previous = payment.paymentKey;
    }

    Configuration.EXPIRATION.capacity = capacity;
}