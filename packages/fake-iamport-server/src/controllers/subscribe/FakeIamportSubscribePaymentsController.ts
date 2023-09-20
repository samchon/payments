import core from "@nestia/core";
import * as nest from "@nestjs/common";
import * as fastify from "fastify";
import { IIamportCardPayment } from "iamport-server-api/lib/structures/IIamportCardPayment";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import { IIamportSubscription } from "iamport-server-api/lib/structures/IIamportSubscription";
import { v4 } from "uuid";

import { FakeIamportPaymentProvider } from "../../providers/FakeIamportPaymentProvider";
import { FakeIamportResponseProvider } from "../../providers/FakeIamportResponseProvider";
import { FakeIamportStorage } from "../../providers/FakeIamportStorage";
import { FakeIamportSubscriptionProvider } from "../../providers/FakeIamportSubscriptionProvider";
import { FakeIamportUserAuth } from "../../providers/FakeIamportUserAuth";
import { AdvancedRandomGenerator } from "../../utils/AdvancedRandomGenerator";

@nest.Controller("subscribe/payments")
export class FakeIampotSubscribePaymentsController {
    /**
     * 카드로 결제하기, 더불어 간편 결제용으로 등록 가능.
     *
     * `subscribe.payments.onetime` 은 카드를 매개로 한 결제를 하고자 할 때 호출하는 API
     * 함수이다. 더하여 입력 값에 {@link IIamportSubscription.IOnetime.customer_uid} 를
     * 기입하는 경우, 결제에 사용한 카드를 그대로 간편 결제용 카드
     * {@link IIamportSubscription} 로 등록해버린다.
     *
     * 다만, 정히 간편 카드 등록과 결제를 동시에 하고 싶다면,
     * `subscribe.payments.onetime` 에 {@link IIamportSubscription.IOnetime.customer_uid}
     * 를 더하기보다, {@link subscribe.customers.store} 와 {@link subscribe.payments.again}
     * 을 각각 호출하는 것을 권장한다. 그것이 예외적인 상황에 보다 안전하게 대처할 수 있기
     * 때문이다.
     *
     * 더하여 `subscribe.payments.onetime` 은 클라이언트 어플리케이션이 아임포트가 제공하는
     * 결제 창을 그대로 사용하는 경우, 귀하의 백엔드 서버가 이를 실 서비스에서 호출하는 일은
     * 없을 것이다. 다만, 고객이 카드를 통하여 결제하는 상황을 시뮬레이션하기 위하여, 테스트
     * 자동화 프로그램 수준에서 사용될 수는 있다.
     *
     * @param input 카드 결제 신청 정보
     * @returns 카드 결제 정보
     *
     * @security bearer
     * @author Samchon
     */
    @core.TypedRoute.Post("onetime")
    public onetime(
        @nest.Request() request: fastify.FastifyRequest,
        @core.TypedBody() input: IIamportSubscription.IOnetime,
    ): IIamportResponse<IIamportCardPayment> {
        FakeIamportUserAuth.authorize(request);

        if (input.customer_uid)
            FakeIamportSubscriptionProvider.store(
                input.customer_uid,
                input as IIamportSubscription.IStore,
            );

        const pg_id: string = v4();
        const payment: IIamportCardPayment = {
            card_code: v4(),
            card_name: AdvancedRandomGenerator.name(),
            card_number: input.card_number,
            card_quota: input.card_quota || 0,
            apply_num: v4(),

            // ORDER INFO
            pay_method: "card",
            currency: input.currency || "KRW",
            merchant_uid: input.merchant_uid,
            imp_uid: v4(),
            name: input.name,
            amount: input.amount,
            cancel_amount: 0,
            receipt_url: "https://github.com/samchon/fake-iamport-server",
            cash_receipt_issue: true,

            // PAYMENT PROVIDER INFO
            channel: Math.random() < 0.5 ? "pc" : "mobile",
            pg_provider: "somewhere",
            emb_pg_provider: null,
            pg_id,
            pg_tid: pg_id,
            escrow: false,

            // BUYER
            buyer_name: input.buyer_name || null,
            buyer_tel: input.buyer_tel || null,
            buyer_email: input.buyer_email || null,
            buyer_addr: input.buyer_addr || null,
            buyer_postcode: input.buyer_postcode || null,
            customer_uid: input.customer_uid || null,
            customer_uid_usage: input.customer_uid ? "issue" : null,
            custom_data: input.custom_data || null,
            user_agent: "Test Automation",

            // TIMESTAMPS
            status: "paid",
            started_at: Date.now() / 1000,
            paid_at: Date.now() / 1000,
            failed_at: 0,
            fail_reason: null,
            cancelled_at: 0,
            cancel_reason: null,
            cancel_history: [],

            // HIDDEN
            notice_url: input.notice_url,
        };
        FakeIamportPaymentProvider.store(payment);

        return FakeIamportResponseProvider.success(payment);
    }

    /**
     * 간편 결제에 등록된 카드로 결제하기.
     *
     * `subscribe.payments.again` 은 고객이 간편 결제에 등록한 카드로 결제를 진행하고자 할 때
     * 호출하는 API 함수이다. 이는 간편하고 불편하고를 떠나, 본질적으로 카드 결제의 일환이기에,
     * 리턴값은 일반적인 카드 결제 때와 동일한 {@link IIamportCardPayment} 이다.
     *
     * 그리고 `subscribe.payments.again` 은 결제 수단 중 유일하게, 클라이언트 어플리케이션이
     * 아임포트가 제공하는 결체 창을 사용할 수 없어, 오직 귀하의 백엔드 서버가 아임포트의 API
     * 함수를 직접 호출해야하는 경우에 해당한다. 따라서 간편 결제에 관하여 아임포트 서버와
     * 연동하는 백엔드 서버 및 프론트 어플리케이션을 개발할 때, 반드시 이 상황에 대한 별도의
     * 설계 및 개발이 필요하니, 이 점을 염두에 두기 바란다.
     *
     * @param input 미리 등록한 카드를 이용한 결제 신청 정보
     * @returns 카드 결제 정보
     *
     * @security bearer
     * @author Samchon
     */
    @core.TypedRoute.Post("again")
    public again(
        @nest.Request() request: fastify.FastifyRequest,
        @core.TypedBody() input: IIamportSubscription.IAgain,
    ): IIamportResponse<IIamportCardPayment> {
        FakeIamportUserAuth.authorize(request);

        const subscription: IIamportSubscription =
            FakeIamportStorage.subscriptions.get(input.customer_uid);

        const pg_id: string = v4();
        const payment: IIamportCardPayment = {
            card_code: subscription.card_code,
            card_name: subscription.card_name,
            card_number: subscription.card_number,
            card_quota: input.card_quota || 0,
            apply_num: v4(),

            // ORDER INFO
            pay_method: "card",
            currency: input.currency || "KRW",
            merchant_uid: input.merchant_uid,
            imp_uid: v4(),
            name: input.name,
            amount: input.amount,
            cancel_amount: 0,
            receipt_url: "https://github.com/samchon/fake-iamport-server",
            cash_receipt_issue: true,

            // PAYMENT PROVIDER INFO
            channel: Math.random() < 0.5 ? "pc" : "mobile",
            pg_provider: "somewhere",
            emb_pg_provider: null,
            pg_id,
            pg_tid: pg_id,
            escrow: false,

            // BUYER
            buyer_name: input.buyer_name || subscription.customer_name || null,
            buyer_tel: input.buyer_tel || subscription.customer_tel || null,
            buyer_email:
                input.buyer_email || subscription.customer_email || null,
            buyer_addr: input.buyer_addr || subscription.customer_addr || null,
            buyer_postcode:
                input.buyer_postcode || subscription.customer_postcode || null,
            customer_uid: subscription.customer_uid,
            customer_uid_usage: "issue",
            custom_data: input.custom_data || null,
            user_agent: "Test Automation",

            // TIMESTAMPS
            status: "paid",
            started_at: Date.now() / 1000,
            paid_at: Date.now() / 1000,
            failed_at: 0,
            fail_reason: null,
            cancelled_at: 0,
            cancel_reason: null,
            cancel_history: [],

            // HIDDEN
            notice_url: input.notice_url,
        };
        FakeIamportPaymentProvider.store(payment);

        return FakeIamportResponseProvider.success(payment);
    }
}
