import core from "@nestia/core";
import * as nest from "@nestjs/common";
import express from "express";
import { v4 } from "uuid";

import { ITossVirtualAccountPayment } from "toss-payments-server-api/lib/structures/ITossVirtualAccountPayment";

import { FakeTossPaymentProvider } from "../providers/FakeTossPaymentProvider";
import { FakeTossStorage } from "../providers/FakeTossStorage";
import { FakeTossUserAuth } from "../providers/FakeTossUserAuth";
import { FakeTossWebhookProvider } from "../providers/FakeTossWebhookProvider";
import { DateUtil } from "../utils/DateUtil";

@nest.Controller("v1/virtual-accounts")
export class FakeTossVirtualAccountsController {
    /**
     * 가상 계좌로 결제 신청하기.
     *
     * `virtual_accounts.store` 는 고객이 결제 수단을 가상 계좌로 선택하는 경우에 호출되는
     * API 함수이다. 물론 고객이 이처럼 가상 계좌를 선택한 경우, 고객이 지정된 계좌에 돈을
     * 입금하기 전까지는 결제가 마무리된 것이 아니기에, {@link ITossPayment.status} 값은
     * `WAITING_FOR_DEPOSIT` 이 된다.
     *
     * 참고로 `virtual_accounts.store` 는 클라이언트 어플리케이션이 토스 페이먼츠가
     * 자체적으로 제공하는 결제 창을 사용하는 경우, 귀하의 백엔드 서버가 이를 실 서비스에서
     * 호출하는 일은 없을 것이다. 다만, 고객이 가상 계좌로 결제를 진행하는 상황을
     * 시뮬레이션하기 위하여, 테스트 자동화 프로그램 수준에서 사용될 수는 있다.
     *
     * 그리고 `virtual_accounts.store` 이후에 고객이 지정된 계좌에 금액을 입금하거든, 토스
     * 페이먼츠 서버로부터 웹훅 이벤트가 발생되어 귀하의 백엔드 서버로 전송된다. 만약 연동
     * 대상 토스 페이먼츠 서버가 실제가 아닌 `fake-toss-payments-server` 라면,
     * {@link internal.virtual_accounts.deposit} 를 호출하여, 고객이 가상 계좌에 입금하는
     * 상황을 시뮬레이션 할 수 있다.
     *
     * @param input 가상 결제 신청 정보.
     * @returns 가상 계좌 결제 정보
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    @core.TypedRoute.Post()
    public store(
        @nest.Request() request: express.Request,
        @core.TypedBody() input: ITossVirtualAccountPayment.IStore,
    ): ITossVirtualAccountPayment {
        FakeTossUserAuth.authorize(request);

        const payment: ITossVirtualAccountPayment = {
            ...FakeTossPaymentProvider.get_common_props(input),
            method: "가상계좌",
            type: "NORMAL",
            status: "WAITING_FOR_DEPOSIT",
            approvedAt: null,
            secret: v4(),
            virtualAccount: {
                accountNumber: "110417532896",
                accountType: "일반",
                bank: input.bank,
                customerName: input.customerName,
                dueDate: DateUtil.to_string(
                    DateUtil.add_days(new Date(), 3),
                    false,
                ),
                expired: false,
                settlementStatus: "INCOMPLETED",
                refundStatus: "NONE",
            },
        };
        FakeTossStorage.payments.set(payment.paymentKey, payment);

        FakeTossWebhookProvider.webhook({
            eventType: "PAYMENT_STATUS_CHANGED",
            data: {
                paymentKey: payment.paymentKey,
                orderId: payment.orderId,
                status: "WAITING_FOR_DEPOSIT",
            },
        }).catch(() => {});

        return payment;
    }
}
