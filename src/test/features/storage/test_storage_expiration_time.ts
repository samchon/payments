import { randint } from "tstl/algorithm/random";
import { IPointer } from "tstl/functional/IPointer";
import { sleep_for } from "tstl/thread/global";
import { assert } from "typia";
import { v4 } from "uuid";

import { TossFakeConfiguration } from "../../../FakeTossConfiguration";
import toss from "../../../api";
import { ITossCardPayment } from "../../../api/structures/ITossCardPayment";
import { ITossPayment } from "../../../api/structures/ITossPayment";
import { FakeTossStorage } from "../../../providers/FakeTossStorage";
import { ArrayUtil } from "../../../utils/ArrayUtil";
import { RandomGenerator } from "../../../utils/RandomGenerator";
import { TestConnection } from "../../internal/TestConnection";
import { exception_must_be_thrown } from "../../internal/exception_must_be_thrown";

export async function test_storage_expiration_time(): Promise<void> {
    const time: number = TossFakeConfiguration.EXPIRATION.time;
    FakeTossStorage.payments.clear();
    TossFakeConfiguration.EXPIRATION.time = 1;

    const previous: IPointer<string | null> = { value: null };
    await ArrayUtil.asyncRepeat(10, async () => {
        const payment: ITossPayment = await toss.functional.v1.payments.key_in(
            TestConnection.FAKE,
            {
                method: "card",

                cardNumber: RandomGenerator.cardNumber(),
                cardExpirationYear: randint(2022, 2028).toString(),
                cardExpirationMonth: randint(1, 12).toString(),

                orderId: v4(),
                amount: 1000,
            },
        );
        assert<ITossCardPayment>(payment);

        await sleep_for(1);
        if (previous.value !== null)
            await exception_must_be_thrown(
                "VirtualTossStorageProvider.payments.get() for expired record",
                () =>
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
    });
    TossFakeConfiguration.EXPIRATION.time = time;
}
