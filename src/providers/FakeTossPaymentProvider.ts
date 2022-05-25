import { v4 } from "uuid";
import { ITossPayment } from "../api/structures/ITossPayment";

export namespace FakeTossPaymentProvider {
    export function get_common_props(input: ITossPayment.IStore) {
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
            requestedAt: new Date().toString(),
            cancels: null,
            cashReceipt: null,
        };
    }
}
