import { TestValidator } from "@nestia/e2e";
import toss from "toss-payments-server-api";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { ITossPaymentWebhook } from "toss-payments-server-api/lib/structures/ITossPaymentWebhook";
import { ITossVirtualAccountPayment } from "toss-payments-server-api/lib/structures/ITossVirtualAccountPayment";
import typia from "typia";
import { v4 } from "uuid";

import { FakeTossStorage } from "../../src/providers/FakeTossStorage";
import { AdvancedRandomGenerator } from "../internal/AdvancedRandomGenerator";
import { TestConnection } from "../internal/TestConnection";

export async function test_fake_virtual_account_payment(): Promise<ITossVirtualAccountPayment> {
  //----
  // 결제하기
  //----
  // 결제 요청 레코드 발행하기
  //
  // 백엔드 서버에서 토스 페이먼츠 서버의 API 를 직접 호출하여, 즉시 승인되는 가상 계좌
  // 결제를 진행하는 게 아닌, 프론트 앱이 토스 페이먼츠가 제공해주는 결제 창을 이용한다는
  // 가정.
  //
  // 토스 페이먼츠는 이처럼 프론트 앱에서 백엔드 서버를 거치지 않고, 토스 페이먼츠 고유의
  // 결제 창을 이용하여 직접 결제를 진행하는 경우, 백엔드 서버에서 이를 별도 승인
  // 처리해주기 전까지 정식 결제로 인정치 아니함.
  //
  // 때문에 {@link ITossVirtualAccountPayment.ICreate.__approved} 값을 `false` 로 하여,
  // 백엔드에서 해당 결제 요청 건에 대하여 별도의 승인 처리가 필요한 상황을 고의로 만듦.
  const payment: ITossVirtualAccountPayment =
    await toss.functional.v1.virtual_accounts.create(TestConnection.FAKE, {
      // 가싱 계좌 정보
      method: "virtual-account",
      bank: "신한",
      customerName: AdvancedRandomGenerator.name(3),

      // 주문 정보
      orderId: v4(),
      orderName: AdvancedRandomGenerator.name(8),
      amount: 25_000,

      // 고의 미승인 처리
      __approved: false,
    });
  typia.assert(payment);

  // 결제 요청 승인하기
  //
  // 백엔드 서버에서 해당 건을 승인함으로써, 비로소 해당 결제가 완성된다.
  const approved: ITossPayment = await toss.functional.v1.payments.approve(
    TestConnection.FAKE,
    payment.paymentKey,
    {
      orderId: payment.orderId,
      amount: payment.totalAmount,
    },
  );
  typia.assert<ITossVirtualAccountPayment>(approved);

  //----
  // 입금하기
  //----
  // 고객이 자신 앞으로 발급된 가상 계좌에
  // 결제 금액을 입금하는 상황 시뮬레이션
  await toss.functional.internal.deposit(
    TestConnection.FAKE,
    payment.paymentKey,
  );

  // 결제 레코드를 다시 불러보면
  const reloaded: ITossPayment = await toss.functional.v1.payments.at(
    TestConnection.FAKE,
    payment.paymentKey,
  );
  typia.assert<ITossVirtualAccountPayment>(reloaded);

  // 결제 완료 처리되었음을 알 수 있다
  TestValidator.equals("status")(reloaded.status)("DONE");

  // 실제로 웹훅 이벤트 발생 내역을 보면,
  // 고객이 가상 계좌에 결제 금액을 입금하였을 때,
  // 결제 완료 처리 또한 함께 이루어졌음을 알 수 있다.
  const webhook: ITossPaymentWebhook = FakeTossStorage.webhooks.get(
    payment.paymentKey,
  );
  TestValidator.equals("status")(webhook.data.status)("DONE");

  // if condition 에 의하여 자동 다운 캐스팅 됨.
  payment.virtualAccount.accountNumber;
  return payment;
}
