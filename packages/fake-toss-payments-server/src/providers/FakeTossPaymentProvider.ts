import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { v4 } from "uuid";

export namespace FakeTossPaymentProvider {
  export function get_common_props(input: ITossPayment.ICreate) {
    return {
      mId: "tosspayments",
      version: "1.3",
      paymentKey: v4(),
      transactionKey: v4(),
      orderId: input.orderId,
      orderName: "test",
      currency: "KRW" as const,
      totalAmount: input.amount,
      balanceAmount: input.amount,
      suppliedAmount: input.amount,
      taxFreeAmount: 0,
      vat: 0,
      useEscrow: false,
      cultureExpense: false,
      requestedAt: new Date().toISOString(),
      cancels: null,
      cashReceipt: null,
    };
  }
}
