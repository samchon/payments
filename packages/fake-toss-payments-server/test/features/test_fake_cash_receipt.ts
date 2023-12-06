import { TestValidator } from "@nestia/e2e";
import toss from "toss-payments-server-api";
import { ITossCashReceipt } from "toss-payments-server-api/lib/structures/ITossCashReceipt";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { ITossVirtualAccountPayment } from "toss-payments-server-api/lib/structures/ITossVirtualAccountPayment";
import typia from "typia";

import { TestConnection } from "../internal/TestConnection";
import { test_fake_virtual_account_payment } from "./test_fake_virtual_account_payment";

export async function test_fake_cash_receipt(): Promise<void> {
  const payment: ITossVirtualAccountPayment =
    await test_fake_virtual_account_payment();
  const receipt: ITossCashReceipt =
    await toss.functional.v1.cash_receipts.create(TestConnection.FAKE, {
      type: "소득공제",
      paymentKey: payment.paymentKey,
      orderId: payment.orderId,
      orderName: payment.orderName,
      registrationNumber: "8803111******",
      amount: payment.totalAmount,
    });
  typia.assert<ITossCashReceipt>(receipt);

  const reloaded: ITossPayment = await toss.functional.v1.payments.at(
    TestConnection.FAKE,
    payment.paymentKey,
  );
  typia.assert<ITossPayment>(reloaded);
  TestValidator.equals("receipt")(reloaded.cashReceipt?.receiptUrl)(
    receipt.receiptUrl,
  );
}
