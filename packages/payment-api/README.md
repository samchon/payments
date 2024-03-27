# Payment API
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/payments/tree/master/LICENSE)
[![npm version](https://badge.fury.io/js/@samchon/payment-api.svg)](https://www.npmjs.com/package/@samchon/payment-api)
[![Downloads](https://img.shields.io/npm/dm/@samchon/payment-api.svg)](https://www.npmjs.com/package/@samchon/payment-api)
[![Build Status](https://github.com/samchon/payments/workflows/build/badge.svg)](https://github.com/samchon/payments/actions?query=workflow%3Abuild)

```bash
npm install --save @samchon/payment-api
```

Software Development Kit of [`@samchon/payment-backend`](https://github.com/samchon/payments/tree/master/packages/payment-backend).

`@samchon/payment-api` 는 통합 결제 시스템 [`@samchon/payment-backend`](https://github.com/samchon/payments/tree/master/packages/payment-backend) 와 연동할 수 있는 SDK 라이브러리이다. 귀하는 이 `@samchon/payment-api` 를 통하여, 통합 결제 서버와 매우 손쉽게 연동할 수 있고, 이를 통하여 결제 부문에 관련된 MSA (Micro Service Architecture) 를 매우 안전하게 구성할 수 있다.

다만 귀하가 [`@samchon/payment-backend`](https://github.com/samchon/payments/tree/master/packages/payment-backend) 와의 연동을, 제공되는 SDK 를 활용하는 것이 아닌 API 스펙을 보고 직접 구현하고자 한다면, 반드시 알아두어야 할 것이 하나 있다. 그것은 바로 [`@samchon/payment-backend`](https://github.com/samchon/payments/tree/master/packages/payment-backend) 가 모든 request 및 response body 에 적재하는 JSON 데이터를, 보안 강화를 위하여 AES 알고리즘으로 암호화한다는 것이다.

  - 서버 접속 정보
    - Host 주소
      - 로컬 서버: http://localhost:37821
      - Dev 서버: https://YOUR-DEV-SERVER
      - Real 서버: https://YOUR-REAL-SERVER
    - 프로토콜: HTTP/S
      - Request/Response Body: Encrypted JSON
      - AES-128/256
        - key: `MCKOxv9B23r7EatArCFcBP03nfaS03T8`
        - iv: `9haeYD1tIf4v8xs7`
      - CBC mode
      - PKCS #5 Padding
      - Base64 Encoding
  - 매뉴얼
    - 자료구조 매뉴얼: [src/api/structures/payments/IPaymentHistory.ts](https://github.com/samchon/payments/tree/master/packages/payment-backend/src/api/structures/payments/IPaymentHistory.ts)
    - API 함수 매뉴얼: [src/api/functional/payments/histories/index.ts](https://github.com/samchon/payments/tree/master/packages/payment-backend/src/api/functional/payments/histories/index.ts)
    - 예제 코드
      - 아임포트
        - 간편 결제 등록: [test_api_iamport_subscription_payment.ts](https://github.com/samchon/payments/blob/master/packages/payment-backend/test/features/iamport/test_api_iamport_subscription_payment.ts)
        - 신용카드 결제: [test_api_iamport_card_payment.ts](https://github.com/samchon/payments/blob/master/packages/payment-backend/test/features/iamport/test_api_iamport_card_payment.ts)
        - 가상 계좌 결제: [test_api_iamport_vbank_payment.ts](https://github.com/samchon/payments/blob/master/packages/payment-backend/test/features/iamport/test_api_iamport_vbank_payment.ts)
      - 토스 페이먼츠
        - 간편 결제 등록: [test_api_toss_vbank_payment.ts](https://github.com/samchon/payments/blob/master/packages/payment-backend/test/features/toss/test_api_toss_vbank_payment.ts)
        - 신용 카드: [test_api_toss_card_payment.ts](https://github.com/samchon/payments/blob/master/packages/payment-backend/test/features/toss/test_api_toss_card_payment.ts)
        - 가상 계좌 결제: [test_api_toss_vbank_payment.ts](https://github.com/samchon/payments/blob/master/packages/payment-backend/test/features/toss/test_api_toss_vbank_payment.ts)
      - 공통: [부분 환불 검증](https://github.com/samchon/payments/blob/master/packages/payment-backend/test/features/internal/validate_payment_cancel_partial.ts)

```typescript
import { TestValidator } from "@nestia/e2e";
import api from "@samchon/payment-api";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";
import { IPaymentWebhookHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentWebhookHistory";
import toss from "toss-payments-server-api";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { sleep_for } from "tstl";
import typia from "typia";
import { v4 } from "uuid";

import { PaymentConfiguration } from "../../../src";
import { FakePaymentStorage } from "../../../src/providers/payments/FakePaymentStorage";
import { TossAsset } from "../../../src/services/toss/TossAsset";

export async function test_api_toss_vbank_payment(
    connection: api.IConnection,
): Promise<IPaymentHistory> {
    //----
    // 결제의 원천이 되는 주문 정보
    //----
    /**
     * 귀하의 백엔드 서버가 발행한 주문 ID.
     */
    const yourOrderId: string = v4();

    /**
     * 주문 금액.
     */
    const yourOrderPrice: number = 19_900;

    /* -----------------------------------------------------------
        결제 내역 등록
    ----------------------------------------------------------- */
    /**
     * 토스 페이먼츠 시뮬레이션
     *
     * 고객이 프론트 어플리케이션에서, 토스 페이먼츠가 제공하는 팝업 창을 이용, 카드 결제를
     * 하는 상황을 시뮬레이션 한다. 고객이 카드 결제를 마치거든, 프론트 어플리케이션에
     * {@link ITossPayment.paymentKey} 가 전달된다.
     *
     * 이 {@link ITossPayment.paymentKey} 와 귀하의 백엔드에서 직접 생성한
     * {@link ITossPayment.orderId yourOrderId} 를 잘 기억해두었다가, 이를 다음 단계인
     * {@link IPaymentHistory} 등록에 사용하도록 하자.
     */
    const payment: ITossPayment =
        await toss.functional.v1.virtual_accounts.create(
            await TossAsset.connection("test-toss-payments-create-id"),
            {
                // 가상 계좌 정보
                method: "virtual-account",
                bank: "신한",
                customerName: "Samchon",

                // 주문 정보
                orderId: yourOrderId,
                orderName: "something",
                amount: yourOrderPrice,

                // 고의 미승인 처리
                __approved: false,
            },
        );
    typia.assert(payment);

    /**
     * 웹훅 URL 설정하기.
     *
     * 웹훅 URL 을 테스트용 API 주소, internal.webhook 으로 설정.
     */
    const webhook_url: string = `http://127.0.0.1:${PaymentConfiguration.API_PORT()}${
        api.functional.payments.internal.webhook.METADATA.path
    }`;

    /**
     * 결제 이력 등록하기.
     *
     * 앞서 토스 페이먼츠의 팝업 창을 이용하여 가상 계좌 결제를 진행하고 발급받은
     * {@link ITossPayment.paymentKey}, 그리고 귀하의 백엔드에서 직접 생성한
     * {@link ITossPayment.orderId yourOrderId} 를 각각 {@link IPaymentVendor.uid} 와
     * {@link IPaymentSource.id} 로 할당하여 {@link IPaymentReservation} 레코드를
     * 발행한다.
     *
     * 참고로 결제 이력을 등록할 때 반드시 비밀번호를 설정해야 하는데, 향후 결제 이력을
     * 조회할 때 필요하니, 이를 반드시 귀하의 백엔드 서버에 저장해두도록 한다.
     */
    const history: IPaymentHistory =
        await api.functional.payments.histories.create(connection, {
            vendor: {
                code: "toss.payments",
                store_id: "test-toss-payments-create-id",
                uid: payment.paymentKey,
            },
            source: {
                schema: "some-schema",
                table: "some-table",
                id: yourOrderId,
            },
            webhook_url, // 테스트용 웹훅 URL
            price: yourOrderPrice,
            password: "some-password",
        });
    typia.assert(history);

    /* -----------------------------------------------------------
        웹훅 이벤트 리스닝
    ----------------------------------------------------------- */
    /**
     * 입금 시뮬레이션하기.
     *
     * 고객이 자신 앞을 발급된 계좌에, 결제 금액을 입금하는 상황 시뮬레이션.
     */
    await toss.functional.internal.deposit(
        await TossAsset.connection("test-toss-payments-create-id"),
        payment.paymentKey,
    );

    // 웹훅 이벤트가 귀하의 백엔드 서버로 전달되기를 기다림.
    await sleep_for(1_000);

    /**
     * 웹흑 리스닝 시뮬레이션.
     *
     * 귀하의 백엔드 서버가 웹훅 이벤트를 수신한 상황을 가정한다.
     */
    const webhook: IPaymentWebhookHistory | undefined =
        FakePaymentStorage.webhooks.back();

    // 이하 웹훅 데이터를 통한 입금 여부 검증
    TestValidator.equals("webhook")(!!webhook)(true);
    TestValidator.equals("history.id")(history.id)(webhook?.current.id);
    TestValidator.equals("paid_at")(!!webhook?.previous.paid_at)(false);
    TestValidator.equals("paid_at")(!!webhook?.current.paid_at)(true);

    // 웹훅 데이터 삭제
    FakePaymentStorage.webhooks.pop_back();

    return history;
}
```