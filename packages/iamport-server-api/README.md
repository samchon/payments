# Iamport Server API
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/payments/LICENSE)
[![npm version](https://badge.fury.io/js/iamport-server-api.svg)](https://www.npmjs.com/package/iamport-server-api)
[![Downloads](https://img.shields.io/npm/dm/iamport-server-api.svg)](https://www.npmjs.com/package/iamport-server-api)
[![Build Status](https://github.com/samchon/payments/workflows/build/badge.svg)](https://github.com/samchon/payments/actions?query=workflow%3Abuild)

```bash
npm install --save iamport-server-api
```

`iamport-server-api` 는 [`fake-iamport-server`](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server) 를 기반으로 만들어진 SDK (Software Development Kit) 이다. 그리고 [`fake-iamport-server`](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server) 는 아임포트의 API 명세사항을 따라 만든 목업 서버이기에, 본 `iamport-server-api` 는 진짜 아임포트 서버와의 연동에도 사용할 수 있다.

고로 아임포트와 연동하는 TypeScript 기반 백엔드 서버를 개발함에 있어, 가짜 아임포트 서버 [`fake-iamport-server`](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server) 는 직접 이용치 않더라도, 실제 아임포트 서버와의 연동을 위하여, 본 SDK 라이브러리만큼은 반드시 설치하기를 권장하는 바이다.

  - **Swagger Editor**: [packages/iamport-server-api/swagger.json](https://editor.swagger.io/?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsamchon%2Fpayments%2Fmaster%2Fpackages%2Fiamport-server-api%2Fswagger.json)
  - 자료 구조: [src/api/structures/IIamportPayment.ts](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server/src/api/structures/IIamportPayment.ts)
  - API 함수: [src/api/functional/payments/index.ts](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server/src/api/functional/payments/index.ts)
  - 예제 코드
    - 본인 인증: [test_fake_certification.ts](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server/test/features/test_fake_certification.ts)
    - 가상 계좌 결제: [test_fake_vbank_payment.ts](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server/test/features/test_fake_vbank_payment.ts)
    - 카드 결제: [test_fake_card_payment.ts](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server/test/features/test_fake_card_payment.ts)
    - 간편 결제 등록
      - [test_fake_subscription_payment_again.ts](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server/test/features/test_fake_subscription_payment_again.ts)
      - [test_fake_subscription_payment_onetime.ts](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server/test/features/test_fake_subscription_payment_onetime.ts)
    - 전체 환불: [test_fake_card_payment_cancel.ts](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server/test/features/test_fake_card_payment_cancel.ts)
    - 부분 환불: [test_fake_card_payment_cancel_partial.ts](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server/test/features/test_fake_card_payment_cancel_partial.ts)
    - 현금 영수증 발행하기: [test_fake_receipt.ts](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server/test/features/test_fake_receipt.ts)

```typescript
import { v4 } from "uuid";

import imp from "iamport-server-api";
import { IIamportCardPayment } from "iamport-server-api/lib/structures/IIamportCardPayment";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";

export async function test_fake_card_payment(): Promise<IIamportCardPayment>
{
    // 커넥터 정보 구성, 토큰 만료시 자동으로 갱신해 줌
    const connector: imp.IamportConnector = new imp.IamportConnector
    (
        "http://127.0.0.1:10851",
        {
            imp_key: "test_imp_key",
            imp_secret: "test_imp_secret"
        }
    );

    // 카드로 결제하기
    const output: IIamportResponse<IIamportCardPayment> = 
        await imp.functional.subscribe.payments.onetime
        (
            await connector.get(),
            {
                card_number: "1111-2222-3333-4444",
                expiry: "2028-12",
                birth: "880311",

                merchant_uid: v4(),
                amount: 25_000,
                name: "Fake 주문"
            }
        );

    // 결제 내역 조회하기
    const reloaded: IIamportResponse<IIamportPayment> = 
        await imp.functional.payments.at
        (
            await connector.get(),
            output.response.imp_uid,
            {},
        );

    // 결제 방식 및 완료 여부 확인
    const payment: IIamportPayment = reloaded.response;
    if (payment.pay_method !== "card")
        throw new Error("Bug on payments.at(): its pay_method must be card.");
    else if (!payment.paid_at || payment.status !== "paid")
        throw new Error("Bug on payments.at(): its status must be paid.");

    // 첫 번째 if condition 에 의해 자동 다운 캐스팅 된 상태
    payment.card_number;
    return payment;
}
```