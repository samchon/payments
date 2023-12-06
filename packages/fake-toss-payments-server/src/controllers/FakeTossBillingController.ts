import core from "@nestia/core";
import { Controller, ForbiddenException } from "@nestjs/common";
import { ITossBilling } from "toss-payments-server-api/lib/structures/ITossBilling";
import { ITossCardPayment } from "toss-payments-server-api/lib/structures/ITossCardPayment";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { v4 } from "uuid";

import { FakeTossUserAuth } from "../decorators/FakeTossUserAuth";
import { FakeTossPaymentProvider } from "../providers/FakeTossPaymentProvider";
import { FakeTossStorage } from "../providers/FakeTossStorage";

@Controller("v1/billing")
export class FakeTossBillingController {
  /**
   * 간편 결제 카드 등록하기.
   *
   * `billing.authorizations.card.create` 는 고객이 자신의 신록 카드를 서버에 등록해두고,
   * 매번 결제가 필요할 때마다 카드 정보를 반복 입력하는 일 없이 간편하게 결제를
   * 진행하고자 할 때, 호출되는 API 함수이다.
   *
   * 참고로 `billing.authorizations.card.create` 는 클라이언트 어플리케이션이 토스
   * 페이먼츠가 제공하는 간편 결제 카드 등록 창을 사용하는 경우, 귀하의 백엔드 서버가 이를
   * 실 서비스에서 호출하는 일은 없을 것이다. 다만, 고객이 간편 결제 카드를 등록하는
   * 상황을 시뮬레이션하기 위하여, 테스트 자동화 프로그램 수준에서 사용될 수는 있다.
   *
   * @param input 간편 결제 카드 등록 정보
   * @returns 간편 결제 카드 정보
   *
   * @security basic
   * @author Samchon
   */
  @core.TypedRoute.Post("authorizations/card")
  public create(
    @FakeTossUserAuth() _0: void,
    @core.TypedBody() input: ITossBilling.ICreate,
  ): ITossBilling {
    const billing: ITossBilling = {
      mId: "tosspyaments",
      method: "카드",
      billingKey: v4(),
      customerKey: input.customerKey,
      cardCompany: "신한",
      cardNumber: input.cardNumber,
      authenticatedAt: new Date().toISOString(),
    };
    FakeTossStorage.billings.set(billing.billingKey, [billing, input]);
    return billing;
  }

  /**
   * 간편 결제로 등록한 수단 조회하기.
   *
   * `billing.authorizations.at` 은 고객이 간편 결제를 위하여 토스 페이먼츠 서버에
   * 등록한 결제 수단을 조회하는 함수이다.
   *
   * 주로 클라이언트 어플리케이션이 토스 페이먼츠가 자체적으로 제공하는 결제 창을 사용하는
   * 경우, 그래서 프론트 어플리케이션이 귀하의 백엔드 서버에 `billingKey` 와` customerKey`
   * 만을 전달해주어, 상세 간편 결제 수단 정보가 필요할 때 사용한다.
   *
   * @param billingKey 대상 정보의 {@link ITossBilling.billingKey}
   * @param input 고객 식별자 키
   * @returns 간편 결제 수단 정보
   *
   * @security basic
   * @author Samchon
   */
  @core.TypedRoute.Post("authorizations/:billingKey")
  public at(
    @FakeTossUserAuth() _0: void,
    @core.TypedParam("billingKey") billingKey: string,
    @core.TypedBody() input: ITossBilling.ICustomerKey,
  ): ITossBilling {
    const tuple = FakeTossStorage.billings.get(billingKey);
    if (tuple[0].customerKey !== input.customerKey)
      throw new ForbiddenException("Different customer.");

    return tuple[0];
  }

  /**
   * 간편 결제에 등록한 수단으로 결제하기.
   *
   * `billing.pay` 는 간편 결제에 등록한 수단으로 결제를 진행하고자 할 때 호출하는 API
   * 함수이다.
   *
   * 그리고 `billing.pay` 는 결제 수단 중 유일하게, 클라이언트 어플리케이션이 토스
   * 페이먼츠가 제공하는 결제 창을 사용할 수 없어, 귀하의 백엔드 서버가 토스 페이먼츠의
   * API 함수를 직접 호출해야 하는 경우에 해당한다. 따라서 간편 결제에 관련하여 토스
   * 페이먼츠와 연동하는 백엔드 서버 및 프론트 어플리케이션을 개발할 때, 반드시 이 상황에
   * 대한 별도의 설계 및 개발이 필요하니, 이 점을 염두에 두기 바란다.
   *
   * 더하여 `billing.pay` 는 철저히 귀사 백엔드 서버의 판단 아래 호출되는 API 함수인지라,
   * 이를 통하여 이루어지는 결제는 일절 {@link payments.approve} 가 필요 없다. 다만
   * `billing.pay` 는 이처럼 부차적인 승인 과정 필요없이 그 즉시로 결제가 완성되니, 이를
   * 호출하는 상황에 대하여 세심히 주의를 기울일 필요가 있다
   *
   * @param billingKey 간편 결제에 등록한 수단의 {@link ITossBilling.billingKey}
   * @param input 주문 정보
   * @returns 결제 정보
   *
   * @security basic
   * @author Samchon
   */
  @core.TypedRoute.Post(":billingKey")
  public pay(
    @FakeTossUserAuth() _0: void,
    @core.TypedParam("billingKey") billingKey: string,
    @core.TypedBody() input: ITossBilling.IPaymentStore,
  ): ITossPayment {
    const tuple = FakeTossStorage.billings.get(billingKey);
    const card: ITossBilling.ICreate = tuple[1];

    const payment: ITossCardPayment = {
      ...FakeTossPaymentProvider.get_common_props(input),
      method: "카드",
      type: "NORMAL",
      status: "DONE",
      approvedAt: new Date().toISOString(),
      discount: null,
      card: {
        company: "신한카드",
        number: card.cardNumber,
        installmentPlanMonths: 0,
        isInterestFree: true,
        approveNo: "temporary-card-approval-number",
        useCardPoint: false,
        cardType: "신용",
        ownerType: "개인",
        acquireStatus: "READY",
        receiptUrl: "https://github.com/samchon/fake-toss-payments-server",
      },
      easyPay: null,
    };
    FakeTossStorage.payments.set(payment.paymentKey, payment);
    return payment;
  }
}
