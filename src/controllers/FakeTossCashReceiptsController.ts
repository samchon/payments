import core from "@nestia/core";
import * as nest from "@nestjs/common";
import * as fastify from "fastify";
import { v4 } from "uuid";

import { ITossCashReceipt } from "toss-payments-server-api/lib/structures/ITossCashReceipt";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";

import { FakeTossStorage } from "../providers/FakeTossStorage";
import { FakeTossUserAuth } from "../providers/FakeTossUserAuth";

@nest.Controller("v1/cash-receipts")
export class FakeTossCashReceiptsController {
    /**
     * 현금 영수증 발행하기.
     *
     * @param input 입력 정보
     * @returns 현금 영수증 정보
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    @core.TypedRoute.Post()
    public store(
        @nest.Request() request: fastify.FastifyRequest,
        @core.TypedBody() input: ITossCashReceipt.IStore,
    ): ITossCashReceipt {
        // VALIADTE
        FakeTossUserAuth.authorize(request);

        // CHECK PAYMENT
        const payment: ITossPayment = FakeTossStorage.payments.get(
            input.paymentKey,
        );
        if (payment.orderId !== input.orderId)
            throw new nest.NotFoundException("Wrong orderId");
        else if (payment.cashReceipt !== null)
            throw new nest.UnprocessableEntityException(
                "Duplicated cash receipt exists.",
            );
        else if (payment.totalAmount < input.amount)
            throw new nest.UnprocessableEntityException(
                "Input amount is greater than its payment.",
            );

        // CONSTRUCT
        const receipt: ITossCashReceipt = {
            orderId: input.orderId,
            orderName: input.orderName,
            type: input.type,
            receiptKey: v4(),
            approvalNumber: v4(),
            approvedAt: new Date().toISOString(),
            canceledAt: null,
            receiptUrl: "https://github.com/samchon/fake-toss-payments-server",
            __paymentKey: payment.paymentKey,
        };
        FakeTossStorage.cash_receipts.set(receipt.receiptKey, receipt);
        payment.cashReceipt = {
            type: receipt.type,
            amount: input.amount,
            taxFreeAmount: input.taxFreeAmount || 0,
            issueNumber: receipt.approvalNumber,
            receiptUrl: receipt.receiptUrl,
        };

        // RETURNS
        return receipt;
    }

    /**
     * 현금 영수증 취소하기.
     *
     * @param receiptKey 현금 영수증의 {@link ITossCashReceipt.receiptKey}
     * @param input 취소 입력 정보
     * @returns 취소된 현금 영수증 정보
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    @core.TypedRoute.Post(":receiptKey/cancel")
    public cancel(
        @nest.Request() request: fastify.FastifyRequest,
        @core.TypedParam("receiptKey", "string") receiptKey: string,
        @core.TypedBody() input: ITossCashReceipt.ICancel,
    ): ITossCashReceipt {
        // VALIADTE
        FakeTossUserAuth.authorize(request);
        input;

        // GET RECORDS
        const receipt: ITossCashReceipt =
            FakeTossStorage.cash_receipts.get(receiptKey);
        const payment: ITossPayment = FakeTossStorage.payments.get(
            receipt.__paymentKey,
        );

        // CHANGE
        receipt.canceledAt = new Date().toISOString();
        payment.cashReceipt = null;

        return receipt;
    }
}
