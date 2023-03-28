import { assert } from "typia";

import toss from "toss-payments-server-api";
import { ITossCashReceipt } from "toss-payments-server-api/lib/structures/ITossCashReceipt";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";

import { TestConnection } from "../../internal/TestConnection";
import { test_fake_virtual_account_payment } from "./test_fake_virtual_account_payment";

export async function test_fake_cash_receipt(): Promise<void> {
    const payment: ITossPayment = await test_fake_virtual_account_payment();
    const receipt: ITossCashReceipt =
        await toss.functional.v1.cash_receipts.store(TestConnection.FAKE, {
            type: "소득공제",
            paymentKey: payment.paymentKey,
            orderId: payment.orderId,
            orderName: payment.orderName,
            registrationNumber: "8803111******",
            amount: payment.totalAmount,
        });
    assert<ITossCashReceipt>(receipt);

    const reloaded: ITossPayment = await toss.functional.v1.payments.at(
        TestConnection.FAKE,
        payment.paymentKey,
    );
    if (reloaded.cashReceipt === null)
        throw new Error(
            "Bug on cash_receipts.store(): failed to store it on the payment.",
        );
}
