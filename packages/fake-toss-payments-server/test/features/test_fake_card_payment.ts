import { TestValidator } from "@nestia/e2e";
import toss from "toss-payments-server-api";
import { ITossCardPayment } from "toss-payments-server-api/lib/structures/ITossCardPayment";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import typia from "typia";
import { v4 } from "uuid";

import { TestConnection } from "../internal/TestConnection";

export async function test_fake_card_payment(): Promise<ITossCardPayment> {
  //----
  // 결제하기
  //----
  // 결제 요청 레코드 발행하기
  //
  // 백엔드 서버에서 토스 페이먼츠 서버의 API 를 직접 호출하여, 즉시 승인되는 카드 결제를
  // 진행하는 게 아닌, 프론트 앱이 토스 페이먼츠가 제공해주는 결제 창을 이용한다는 가정.
  //
  // 토스 페이먼츠는 이처럼 프론트 앱에서 백엔드 서버를 거치지 않고, 토스 페이먼츠 고유의
  // 결제 창을 이용하여 직접 결제를 진행하는 경우, 백엔드 서버에서 이를 별도 승인
  // 처리해주기 전까지 정식 결제로 인정치 아니함.
  //
  // 때문에 {@link ITossCardPayment.ICreate.__approved} 값을 `false` 로 하여,
  // 백엔드에서 해당 결제 요청 건에 대하여 별도의 승인 처리가 필요한 상황을 고의로 만듦.
  const payment: ITossCardPayment = await toss.functional.v1.payments.key_in(
    TestConnection.FAKE,
    {
      // 카드 정보
      method: "card",
      cardNumber: "1111222233334444",
      cardExpirationYear: "24",
      cardExpirationMonth: "03",

      // 주문 정보
      orderId: v4(),
      amount: 30_000,

      // FAKE PROPERTY
      __approved: false,
    },
  );
  typia.assert(payment);

  // 잘못된 `orderId` 로 승인 처리시, 불발됨
  await TestValidator.error(
    "VirtualTossPaymentsController.approve() with wrong orderId",
  )(() =>
    toss.functional.v1.payments.approve(
      TestConnection.FAKE,
      payment.paymentKey,
      {
        orderId: "wrong-order-id",
        amount: payment.totalAmount,
      },
    ),
  );

  // 잘못된 결제 금액으로 승인 처리시, 마찬가지로 불발됨
  await TestValidator.error(
    "VirtualTossPaymentsController.approve() with wrong amount",
  )(() =>
    toss.functional.v1.payments.approve(
      TestConnection.FAKE,
      payment.paymentKey,
      {
        orderId: payment.orderId,
        amount: payment.totalAmount - 100,
      },
    ),
  );

  // 정확한 `orderId` 와 주문 금액을 입력해야 비로소 승인 처리된다.
  const approved: ITossPayment = await toss.functional.v1.payments.approve(
    TestConnection.FAKE,
    payment.paymentKey,
    {
      orderId: payment.orderId,
      amount: payment.totalAmount,
    },
  );
  const card: ITossCardPayment = typia.assert<ITossCardPayment>(approved);
  TestValidator.equals("approvedAt")(!!card.approvedAt)(true);
  TestValidator.equals("status")(card.status)("DONE");

  return card;
}
