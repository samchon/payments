import { assertType } from "typescript-is";
import { v4 } from "uuid";

import toss from "../../../api";
import { ITossVirtualAccountPayment } from "../../../api/structures/ITossVirtualAccountPayment";
import { FakeTossStorage } from "../../../providers/FakeTossStorage";

import { RandomGenerator } from "../../../utils/RandomGenerator";
import { TestConnection } from "../../internal/TestConnection";

export async function test_virtual_webhook(): Promise<void>
{
    const orderId: string = v4();
    const amount: number = 100;

    // ISSUE AN PAYMENT RECORD
    const payment: ITossVirtualAccountPayment = await toss.functional.virtual_accounts.store
    (
        TestConnection.LOCAL,
        {
            method: "virtual-account",
            customerName: RandomGenerator.name(3),
            orderName: RandomGenerator.name(8),
            bank: "신한",
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

    // GENERATE A FAKE WEBHOOK
    await toss.functional.internal.webhook
    (
        TestConnection.LOCAL,
        {
            eventType: "PAYMENT_STATUS_CHANGED",
            data: {
                paymentKey: payment.paymentKey,
                orderId: payment.orderId,
                status: "DONE"
            }
        }
    );
    FakeTossStorage.webhooks.get(payment.paymentKey);
    
    // CHECK THE STATUS CHANGEMENT
    const reloaded = await toss.functional.payments.at(TestConnection.LOCAL, payment.paymentKey);
    assertType<typeof reloaded>(reloaded);
    
    if (reloaded.status !== "DONE")
        throw new Error("Bug on Webhook.");
}