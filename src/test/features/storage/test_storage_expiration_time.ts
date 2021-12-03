import { randint } from "tstl/algorithm/random";
import { sleep_for } from "tstl/thread/global";
import { assertType } from "typescript-is";
import { v4 } from "uuid";

import toss from "../../../api";
import { ITossPayment } from "../../../api/structures/ITossPayment";

import { TossFakeConfiguration } from "../../../FakeTossConfiguration";
import { FakeTossStorage } from "../../../providers/FakeTossStorage";
import { TestConnection } from "../../internal/TestConnection";
import { RandomGenerator } from "../../../utils/RandomGenerator";
import { exception_must_be_thrown } from "../../internal/exception_must_be_thrown";

export async function test_storage_expiration_time(): Promise<void>
{
    let time: number = TossFakeConfiguration.EXPIRATION.time;
    FakeTossStorage.payments.clear();
    TossFakeConfiguration.EXPIRATION.time = 1;

    let previous: string | null = null;
    for (let i: number = 0; i < 10; ++i)
    {
        const payment: ITossPayment = await toss.functional.v1.payments.key_in
        (
            TestConnection.FAKE,
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
                () => toss.functional.v1.payments.at(TestConnection.FAKE, previous!)
            );
        await toss.functional.v1.payments.at(TestConnection.FAKE, payment.paymentKey);
        previous = payment.paymentKey;
    }
    TossFakeConfiguration.EXPIRATION.time = time;
}