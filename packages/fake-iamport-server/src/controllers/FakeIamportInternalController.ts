import core from "@nestia/core";
import { Controller, UnprocessableEntityException } from "@nestjs/common";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportUser } from "iamport-server-api/lib/structures/IIamportUser";

import { FakeIamportUserAuth } from "../decorators/FakeIamportUserAuth";
import { FakeIamportPaymentProvider } from "../providers/FakeIamportPaymentProvider";
import { FakeIamportStorage } from "../providers/FakeIamportStorage";

@Controller("internal")
export class FakeIamportInternalController {
  /**
   * 웹훅 이벤트 더미 리스너.
   *
   * `internal.webhook` 은 실제 아임포트의 서버에는 존재하지 않는 API 로써,
   * `fake-impoart-server` 의 {@link Configuration.WEBHOOK_URL} 에 아무런 URL 을 설정하지
   * 않으면, `fake-iamport-server` 로부터 발생하는 모든 종류의 웹훅 이벤트는 이 곳으로 전달되어
   * 무의미하게 사라진다.
   *
   * 따라서 `fake-iamport-server` 를 사용하여 아임포트 서버와의 연동을 미리 검증코자 할 때는,
   * 반드시 {@link Configuration.WEBHOOK_URL} 를 설정하여 웹훅 이벤트가 귀하의 백엔드 서버로
   * 제대로 전달되도록 하자.
   *
   * @param input 웹훅 이벤트 정보
   *
   * @author Samchon
   */
  @core.TypedRoute.Post("webhook")
  public webhook(@core.TypedBody() input: IIamportPayment.IWebhook): void {
    input; // DO NOTHING
  }

  /**
   * 가상 계좌에 입금하기.
   *
   * `internal.deposit` 은 실제 아임포트 결제 서버에는 존재하지 않는 API 로써, 가상 계좌
   * 결제를 신청한 고객이, 이후 가상 계좌에 목표 금액을 입금하는 상황을 시뮬레이션 할 수 있는
   * 함수이다.
   *
   * 즉, `internal.deposit` 는 고객이 스스로에게 가상으로 발급된 계좌에 입금을 하고, 그에 따라
   * 아임포트 서버에서 webhook 이벤트가 발생, 이를 귀하의 백엔드 서버로 전송하는 일련의 상황을
   * 시뮬레이션하기 위하여 설계된 테스트 함수다.
   *
   * @param imp_uid 대상 결제의 {@link IIamportVBankPayment.imp_uid}
   *
   * @security bearer
   * @author Samchon
   */
  @core.TypedRoute.Put("deposit/:imp_uid")
  public deposit(
    @FakeIamportUserAuth() _user: IIamportUser.IAccessor,
    @core.TypedParam("imp_uid") imp_uid: string,
  ): void {
    // GET PAYMENT RECORD
    const payment: IIamportPayment = FakeIamportStorage.payments.get(imp_uid);
    if (payment.pay_method !== "vbank")
      throw new UnprocessableEntityException("Not a virtual bank payment.");

    // MODIFY
    payment.status = "paid";
    payment.paid_at = Date.now() / 1000;

    // INFORM
    FakeIamportPaymentProvider.webhook(payment).catch(() => {});
  }
}
