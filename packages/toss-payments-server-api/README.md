# Toss Payments Server API
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/payments/LICENSE)
[![npm version](https://badge.fury.io/js/toss-payments-server-api.svg)](https://www.npmjs.com/package/toss-payments-server-api)
[![Downloads](https://img.shields.io/npm/dm/toss-payments-server-api.svg)](https://www.npmjs.com/package/toss-payments-server-api)
[![Build Status](https://github.com/samchon/payments/workflows/build/badge.svg)](https://github.com/samchon/payments/actions?query=workflow%3Abuild)

```bash
npm install --save toss-payments-server-api
```

`toss-payments-server-api` 는 [`fake-toss-payments-server`](https://github.com/samchon/payments/tree/master/packages/fake-toss-payments-server) 를 기반으로 만들어진 SDK (Software Development Kit) 이다. 그리고 [`fake-toss-payments-server`](https://github.com/samchon/payments/tree/master/packages/fake-toss-payments-server) 는 아임포트의 API 명세사항을 따라 만든 목업 서버이기에, 본 `toss-payments-server-api` 는 진짜 토스 페이먼츠 서버와의 연동에도 사용할 수 있다.

고로 아임포트와 연동하는 TypeScript 기반 백엔드 서버를 개발함에 있어, 가짜 토스 페이먼츠 서버 [`fake-toss-payments-server`](https://github.com/samchon/payments/tree/master/packages/fake-toss-payments-server) 는 직접 이용치 않더라도, 실제 토스 페이먼츠 서버와의 연동을 위하여, 본 SDK 라이브러리만큼은 반드시 설치하기를 권장하는 바이다

  - **Swagger Editor**: [toss-payments-server-api/swagger.json](https://editor.swagger.io/?url=https%3A%2F%2Fgithub.com%2Fsamchon%2Fpayments%2Fblob%2Fmaster%2Fpackages%2Ftoss-payments-server-api%2Fswagger.json)
  - 자료 구조: [src/api/structures/ITossBilling.ts](https://github.com/samchon/payments/tree/master/packages/fake-toss-payments-server/src/api/structures/ITossBilling.ts)
  - API 함수: [src/api/functional/v1/payments/index.ts](https://github.com/samchon/payments/tree/master/packages/fake-toss-payments-server/src/api/functional/v1/payments/index.ts)
  - 예제 코드
    - 간편 결제: [test_fake_billing_payment.ts](https://github.com/samchon/payments/tree/master/packages/fake-toss-payments-server/test/features/test_fake_billing_payment.ts)
    - 카드 결제: [test_fake_card_payment.ts](https://github.com/samchon/payments/tree/master/packages/fake-toss-payments-server/test/features/test_fake_card_payment.ts)
    - 가상 계좌 결제: [test_fake_virtual_account_payment.ts](https://github.com/samchon/payments/tree/master/packages/fake-toss-payments-server/test/features/test_fake_virtual_account_payment.ts)
    - 현금 영수증 발행: [test_fake_cash_receipt.ts](https://github.com/samchon/payments/tree/master/packages/fake-toss-payments-server/test/features/test_fake_cash_receipt.ts)

```typescript
import btoa from "btoa";
import toss from "toss-payments-server-api";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import typia from "typia";

export async function test_fake_card_payment_approval(): Promise<void>
{
    const connection: toss.IConnection = {
        host: "http://127.0.0.1:30771", // FAKE-SERVER
        // host: "https://api.tosspayments.com", // REAL-SERVER
        headers: {
            Authorization: `Basic ${btoa("test_ak_ZORzdMaqN3wQd5k6ygr5AkYXQGwy:")}`
        }
    };

    const payment: ITossPayment = await toss.functional.v1.payments.key_in
    (
        connection,
        {
            // CARD INFORMATION
            method: "card",
            cardNumber: "1111222233334444",
            cardExpirationYear: "24",
            cardExpirationMonth: "03",

            // ORDER INFORMATION
            orderId: "some-order-id",
            amount: 25_000,

            // FAKE PROPERTY
            __approved: false
        }
    );
    typia.assert<ITossPayment>(payment);

    const approved: ITossPayment = await toss.functional.v1.payments.approve
    (
        connection,
        payment.paymentKey,
        {
            orderId: payment.orderId,
            amount: payment.totalAmount,
        }
    );
    typia.assert<ITossPayment>(approved);
}
```