# Payments System
## Outline
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/payments/tree/master/LICENSE)
[![Build Status](https://github.com/samchon/payments/workflows/build/badge.svg)](https://github.com/samchon/payments/actions?query=workflow%3Abuild)

통합 결제 시스템과 PG사 연동 라이브러리 모음.

본 저장소 `@samchon/payments` 는 [통합 결제 시스템](https://github.com/samchon/payments/tree/master/packages/payment-backend)과 PG 사 연동 라이브러리를 모아놓은 저장소이다. 여기서 말하는 [통합 결제 시스템](https://github.com/samchon/payments/tree/master/packages/payment-backend)이란, [아임포트](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server)와 [토스 페이먼츠](https://github.com/samchon/payments/tree/master/packages/fake-toss-payments-server) 등의 PG사들을 일괄 관리할 수 있는 시스템을 뜻한다. 더하여 [통합 결제 시스템](https://github.com/samchon/payments/tree/master/packages/payment-backend)은 MSA (Micro Service Architecture) 를 고려하여 설계된 프로젝트로써, 귀하의 서비스 중 결제 부문만을 따로이 분리하여 관리할 수 있게 해 준다.

더하여 [통합 결제 시스템](https://github.com/samchon/payments/tree/master/packages/payment-backend)이 연동하게 될 PG 사들의 목업 서버를 구현, 이들을 통하여 백엔드 수준의 테스트 자동화 프로그램을 구성할 수 있도록 해준다. 이는 결제 PG 사들이 프론트 어플리케이션과 연동한 수기 테스트를 필요로 하기에, [통합 결제 시스템](https://github.com/samchon/payments/tree/master/packages/payment-backend)이 자동화된 테스트 프로그램을 구성할 수 없음에 따른, 테스트 커버리지의 하락을 해결하기 위함이다.

  - [`@samchon/payment-backend`](https://github.com/samchon/payments/tree/master/packages/payment-backend): 통합 결제 시스템
  - [`fake-iamport-server`](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server): 아임포트 목업 서버
  - [`fake-toss-payments-server`](https://github.com/samchon/payments/tree/master/packages/fake-toss-payments-server): 토스 페이먼츠 목업 서버

더불어 본 저장소 `@samchon/payments` 는 [통합 결제 시스템](https://github.com/samchon/payments/tree/master/packages/payment-backend) 및 각각의 PG 사와 연동할 수 있는 SDK (Software Development Kit) 라이브러리들을 제공한다. 귀하는 이를 통하여 [통합 결제 시스템](https://github.com/samchon/payments/tree/master/packages/payment-backend) 및 PG 사 서버와 매우 간편하게, 또한 타입 안전하게 연동할 수 있다. 아래 예제 코드 또한, 이러한 SDK 를 활용한 간편하고 타입 안전한 개발 사례의 하나.
 
  - [`@samchon/payment-api`](https://github.com/samchon/payments/tree/master/packages/payment-api): 통합 결제 시스템 연동 API
  - [`iamport-server-api`](https://github.com/samchon/payments/tree/master/packages/iamport-server-api): 아임포트 서버 연동 API
  - [`toss-payments-server-api`](https://github.com/samchon/payments/tree/master/packages/toss-payments-server-api): 토스 페이먼츠 서버 연동 API

```typescript
import { TestValidator } from "@nestia/e2e";
import api from "@samchon/payment-api";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";
import { IPaymentWebhookHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentWebhookHistory";
import toss from "toss-payments-server-api";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { sleep_for } from "tstl/thread/global";
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




## Setup
본 [통합 결제 시스템](https://github.com/samchon/payments/tree/master/packages/payment-backend)은 NodeJS 및 Postgres 가 필요하다.

[통합 결제 시스템](https://github.com/samchon/payments/tree/master/packages/payment-backend)의 설치 매뉴얼을 읽고, 이를 잘 따라하도록 하자.

  - [설치 매뉴얼](https://github.com/samchon/payments/tree/master/packages/payment-backend#2-installation)
