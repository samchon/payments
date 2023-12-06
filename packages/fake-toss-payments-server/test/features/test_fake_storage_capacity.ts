import { TestValidator } from "@nestia/e2e";
import toss from "toss-payments-server-api";
import { ITossBilling } from "toss-payments-server-api/lib/structures/ITossBilling";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { randint } from "tstl/algorithm/random";
import { IPointer } from "tstl/functional/IPointer";
import { assert } from "typia";
import { v4 } from "uuid";

import { FakeTossConfiguration } from "../../src/FakeTossConfiguration";
import { FakeTossStorage } from "../../src/providers/FakeTossStorage";
import { AdvancedRandomGenerator } from "../internal/AdvancedRandomGenerator";
import { TestConnection } from "../internal/TestConnection";

export async function test_fake_storage_capacity(): Promise<void> {
  const capacity: number = FakeTossConfiguration.EXPIRATION.capacity;

  FakeTossStorage.payments.clear();
  FakeTossStorage.billings.clear();
  FakeTossConfiguration.EXPIRATION.capacity = 1;

  const previous: IPointer<string | null> = { value: null };
  for (let i: number = 0; i < 10; ++i) {
    // GENERATE RANDOM BILLING
    const customerKey: string = v4();
    const billing: ITossBilling =
      await toss.functional.v1.billing.authorizations.card.create(
        TestConnection.FAKE,
        {
          customerKey,
          customerBirthday: "880311",
          cardNumber: AdvancedRandomGenerator.cardNumber(),
          cardExpirationYear: randint(22, 28).toString(),
          cardExpirationMonth: randint(1, 12).toString().padStart(2, "0"),
          cardPassword: randint(0, 9999).toString().padStart(4, "0"),
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
        toss.functional.v1.payments.at(TestConnection.FAKE, previous.value!),
      );
    await toss.functional.v1.payments.at(
      TestConnection.FAKE,
      payment.paymentKey,
    );
    previous.value = payment.paymentKey;
  }

  FakeTossConfiguration.EXPIRATION.capacity = capacity;
}
