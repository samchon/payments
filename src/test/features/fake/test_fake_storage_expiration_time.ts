import { randint } from "tstl/algorithm/random";
import { sleep_for } from "tstl/thread/global";
import { assertType } from "typescript-is";
import { v4 } from "uuid";

import toss from "../../../api";
import { ITossPayment } from "../../../api/structures/ITossPayment";

import { Configuration } from "../../../Configuration";
import { FakeTossStorage } from "../../../providers/FakeTossStorage";
import { TestConnection } from "../../internal/TestConnection";
import { RandomGenerator } from "../../../utils/RandomGenerator";
import { exception_must_be_thrown } from "../../internal/exception_must_be_thrown";

export async function test_virtual_storage_expiration_time(): Promise<void>
{
    let time: number = Configuration.EXPIRATION.time;
    FakeTossStorage.payments.clear();
    Configuration.EXPIRATION.time = 1;

    let previous: string | null = null;
    for (let i: number = 0; i < 10; ++i)
    {
        const payment: ITossPayment = await toss.functional.payments.key_in
        (
            TestConnection.LOCAL,
            {
                method: "card",

                cardNumber: RandomGenerator.cardNumber(),
                cardExpirationYear: randint(2022, 2028).toString(),
                cardExpirationMonth: randint(1, 12).toString(),

                orderId: v4(),
                amount: 1000
            }
        );
        assertType<typeof payment>(payment);

        await sleep_for(1);
        if (previous !== null)
            await exception_must_be_thrown
            (
                "VirtualTossStorageProvider.payments.get() for expired record",
                () => toss.functional.payments.at(TestConnection.LOCAL, previous!)
            );
        await toss.functional.payments.at(TestConnection.LOCAL, payment.paymentKey);
        previous = payment.paymentKey;
    }
    Configuration.EXPIRATION.time = time;
}