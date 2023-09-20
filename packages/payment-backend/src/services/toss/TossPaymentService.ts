import { IPaymentHistory } from "payment-api/lib/structures/payments/IPaymentHistory";
import toss from "toss-payments-server-api";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { ITossPaymentCancel } from "toss-payments-server-api/lib/structures/ITossPaymentCancel";

import { ErrorUtil } from "../../utils/ErrorUtil";
import { TossAsset } from "./TossAsset";
import { TossPaymentBillingService } from "./TossPaymentBillingService";
import { TossPaymentCardService } from "./TossPaymentCardService";
import { TossPaymentVirtualAccountService } from "./TossPaymentVirtualAccountService";

export namespace TossPaymentService {
    export async function at(
        storeId: string,
        paymentKey: string,
    ): Promise<ITossPayment> {
        try {
            return await toss.functional.v1.payments.at(
                await TossAsset.connection(storeId),
                paymentKey,
            );
        } catch (exp) {
            await ErrorUtil.log("TossPaymentService.at", exp as any);
            throw exp;
        }
    }

    export async function approve(
        storeId: string,
        paymentKey: string,
        input: ITossPayment.IApproval,
    ): Promise<ITossPayment> {
        try {
            return await toss.functional.v1.payments.approve(
                await TossAsset.connection(storeId),
                paymentKey,
                input,
            );
        } catch (exp) {
            await ErrorUtil.log("TossPaymentService.approve", exp as any);
            throw exp;
        }
    }

    export function parse(data: ITossPayment): IPaymentHistory.IProps {
        return {
            currency: data.currency,
            price: data.totalAmount,
            refund: data.cancels?.length
                ? data.cancels
                      .map((c) => c.cancelAmount)
                      .reduce((a, b) => a + b, 0)
                : 0,
            paid_at:
                (data.status === "DONE" ||
                    data.status === "CANCELED" ||
                    data.status === "PARTIAL_CANCELED") &&
                data.approvedAt !== null
                    ? new Date(data.approvedAt)
                    : null,
            cancelled_at:
                data.status === "CANCELED" || data.status === "PARTIAL_CANCELED"
                    ? new Date()
                    : null,
            cancels: (data.cancels ?? []).map((c) => ({
                data: c,
                created_at: new Date(c.canceledAt),
                price: c.cancelAmount,
                reason: c.cancelReason,
            })),
            data,
        };
    }

    /* ----------------------------------------------------------------
        API
    ---------------------------------------------------------------- */
    export function store(
        storeId: string,
        input: ITossPayment.IStore,
    ): Promise<ITossPayment> {
        if (input.method === "billing")
            return TossPaymentBillingService.pay(storeId, input);
        else if (input.method === "card")
            return TossPaymentCardService.store(storeId, input);
        else return TossPaymentVirtualAccountService.store(storeId, input);
    }

    export async function cancel(
        storeId: string,
        input: ITossPaymentCancel.IStore,
    ): Promise<ITossPayment> {
        return toss.functional.v1.payments.cancel(
            await TossAsset.connection(storeId),
            input.paymentKey,
            input,
        );
    }
}
