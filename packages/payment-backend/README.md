# Payment Backend
## 1. Outline
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/payments/tree/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@samchon/payment-backend.svg)](https://www.npmjs.com/package/@samchon/payment-backend)
[![Downloads](https://img.shields.io/npm/dm/@samchon/payment-backend.svg)](https://www.npmjs.com/package/@samchon/payment-backend)
[![Build Status](https://github.com/samchon/payments/workflows/build/badge.svg)](https://github.com/samchon/payments/actions?query=workflow%3Abuild)

`payment-backend` 는 통합 결제 서버를 구현한 프로젝트이다. 

여기서 말하는 통합 결제란, [아임포트](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server)나 [토스 페이먼츠](https://github.com/samchon/payments/tree/master/packages/fake-toss-payments-server) 등, 여러 PG 사들을 일괄 관리할 수 있다는 뜻이다. 더하여 `@samchon/payment-backend` 는 MSA (Micro Service Architecture) 를 고려하여 설계된 프로젝트로써, 귀하의 서비스 중 결제 부문만을 따로이 분리하여 관리할 수 있다.

또한 `@samchon/payment-backend` 가 연동하게 되는 결제 PG 사들은 본디 프론트 어플리케이션과 연동한 수기 테스트가 필요하다. 이 때문에 이들 결제 PG 사들과 연동해야 하는 결제 서버들은, 테스트 자동화 프로그램을 작성할 수 없기에, 필연적으로 테스트 커버리지가 낮아 매우 불안정해진다. 하지만 `@samchon/payment-backend` 는 결제 PG 사들의 API 를 흉내낸 가짜 PG 서버들을 구현, 이들을 통하여 테스트 자동화 프로그램을 구성함으로써 안정성을 담보한다.

  - [fake-iamport-server](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server)
  - [fake-toss-payments-server](https://github.com/samchon/payments/tree/master/packages/fake-toss-payments-server)

더불어 `@samchon/payment-backend` 는 `@samchon/payment-api` 라 하여, 통합 결제 서버와 연동할 수 있는 SDK 라이브러리를 제공한다. 귀하는 이 `@samchon/payment-api` 를 통하여, 통합 결제 서버와 매우 손쉽게 연동할 수 있고, 이를 통하여 결제 부문에 관련된 MSA (Micro Service Architecture) 를 매우 안전하게 구성할 수 있다.

그리고 만일 귀하가 `@samchon/payment-backend` 와의 연동을, 제공되는 SDK 를 활용하는 것이 아닌 API 스펙을 보고 직접 구현하고자 한다면, 반드시 알아두어야 할 것이 하나 있다. 그것은 바로 `@samchon/payment-backend` 가 모든 request 및 response body 에 적재하는 JSON 데이터를, 보안 강화를 위하여 AES 알고리즘으로 암호화한다는 것이다.

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




## 2. Installation
### 2.1. NodeJS
본 서버 프로그램은 TypeScript 로 만들어졌으며, NodeJS 에서 구동된다. 

고로 제일 먼저 할 일은, NodeJS 를 설치하는 것이다. 아래 링크를 열어, NodeJS 프로그램을 다운로드 받은 후 즉각 설치하기 바란다. 참고로 NodeJS 버전은 어지간히 낮은 옛 시대의 버전만 아니면 되니, 구태여 latest 버전을 설치할 필요는 없으며, stable 버전만으로도 충분하다.

  - https://nodejs.org/en/

### 2.2. PostgreSQL
본 서버는 PostgreSQL 을 사용하고 있다. 

따라서 로컬에서 DB 서버를 개발하고 구동하려거든, PostgreSQL 이 반드시 설치되어있어야 한다. 아래 링크를 참조하여, PostgreSQL 14 버전을 설치할 것. 단, PostgreSQL 을 설치하면서, StackBuilder 와 PostGIS 도 함께 설치해줘야 한다.

  - https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
  - https://postgis.net/workshops/postgis-intro/installation.html

![PostgreSQL installer](assets/images/postgresql-installer.png)

![StackBuilder installer](assets/images/stackbuilder-installer.png)

그리고 만일 개발 환경이 윈도우라면, 환경변수 PATH 에 PostgreSQL 이 설치된 경로의 `bin` 폴더를 추가해준다. 아마도 그 경로는 `C:\Program Files\PostgreSQL\14\bin` 일 것이다. 맥북의 경우에는 `/Applications/Postgres.app/Contents/MacOS/bin` 이다.

이후 PostgreSQL 터미널로 접속, `samchon` DB 와 `payments` 스키마를 각각 생성해준다. 그리고 `samchon` 과 `samchon_r` 계정을 생성하여, 각각 쓰기 및 읽기 권한을 부여한다.

만일 로컬 PostgreSQL 의 계정을 `postgres`, 그리고 비밀번호를 `root` 로 설정하였다면, `npm run schema` 명령어로 아래 SQL 스크립트를 대체할 수 있다.

```sql
-- CREATE USER
CREATE ROLE samchon_w WITH ENCRYPTED PASSWORD 'https://github.com/samchon';
GRANT samchon_w TO postgres;

-- CREATE DB & SCHEMA
CREATE DATABASE samchon OWNER samchon_w;
CREATE SCHEMA payments AUTHORIZATION samchon_w;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA payments TO samchon;

-- READABLE ACCOUNT
CREATE USER samchon_r WITH ENCRYPTED PASSWORD 'https://github.com/samchon';
GRANT CONNECT ON DATABASE samchon TO samchon_r;
GRANT USAGE ON SCHEMA payments TO samchon_r;
GRANT SELECT ON ALL TABLES IN SCHEMA payments TO samchon_r;
```

### 2.3. Server
NodeJS 및 PostgreSQL 의 설치가 끝났다면, 바로 `payment-backend` 구동을 시작할 수 있다. 

제일 먼저 `git clone` 을 통하여, 결제 서버 프로젝트를 로컬 저장소에 복사하도록 한다. 그리고 해당 폴더로 이동하여 `npm install` 명령어를 실행함으로써, 통합 결제 서버를 구동하는 데 필요한 라이브러리들을 다운로드 한다. 그리고 `npm run build` 명령어를 입력하여, 결제 서버의 소스 코드를 컴파일한다. 마지막으로 `npm run pm2:start` 명령어를 실행해주면, 결제 서버가 구동된다. 

다만 `payment-backend` 를 구동하기 전, 각각 [PaymentConfiguration](https://github.com/samchon/payments/tree/master/src/PaymentConfiguration.ts) 과 [PaymentGlobal](https://github.com/samchon/payments/tree/master/src/PaymentGlobal.ts) 클래스에 어떠한 속성들이 있는지 꼼꼼히 읽어보고, 귀하의 서비스에 알맞는 설정을 해 주도록 한다.

```bash
# CLONE REPOSITORY
git clone https://github.com/samchon/payments
cd packages/payment-backend/payments

# INSTALLATION & COMPILATION
npm install
npm run build
npm run schema

# START SERVER & STOP SERVER
npm run pm2:start
npm run pm2:stop
```

[![npm version](https://img.shields.io/npm/v/@samchon/payment-backend.svg)](https://www.npmjs.com/package/@samchon/payment-backend)
[![Downloads](https://img.shields.io/npm/dm/@samchon/payment-backend.svg)](https://www.npmjs.com/package/@samchon/payment-backend)

더하여 `@samchon/payment-backend` 는 npm 모듈로 설치하여 `import` 할 수 있다.

이러한 방식은 `@samchon/payment-backend` 와 연동하는 백엔드 서버를 개발할 때 특히 유용하다. 해당 백엔드 서버의 안정성을 상시 보증하기 위하여 테스트 자동화 프로그램을 개발할 때, 테스트 자동화 프로그램에서 `@samchon/payment-backend` 의 설정과 개설 및 폐쇄를 완전히 통제할 수 있기 때문이다.

따라서 귀하의 백엔드 서버가 TypeScript 내지 JavaScript 를 사용한다면, 테스트 자동화 프로그램을 구성함에 있어 github 저장소를 clone 하고 `@samchon/payment-backend` 를 별도 구동하기보다, 귀하의 백엔드 서버 테스트 프로그램에서 `@samchon/payment-backend` 모듈을 `import` 후 그것의 개설과 폐쇄를 직접 통제하는 것을 권장한다.

그리고 이렇게 테스트 자동화 프로그램으로 `@samchon/payment-backend` 를 `import` 하여 사용할 때 역시, 각각 [PaymentConfiguration](https://github.com/samchon/payments/tree/master/src/PaymentConfiguration.ts) 과 [PaymentGlobal](https://github.com/samchon/payments/tree/master/src/PaymentGlobal.ts) 클래스에 어떠한 속성들이 있는지 꼼꼼히 읽어보고, 귀하의 서비스에 알맞는 설정을 해 주도록 한다.

```typescript
// npm install --save-dev @samchon/payment-backend
import payments from "@samchon/payment-backend";

async function main(): Promise<void>
{
    // UPDATOR SERVER OPENING
    const updator = await payments.PaymentUpdator.master();

    // BACKEND OPENING
    const backend: payments.PaymentBackend = new payments.PaymentBackend();
    await backend.open();

    // CLOSING
    await backend.close();
    await updator.close();
}
```

### 2.4. Software Development Kit
[![npm version](https://img.shields.io/npm/v/@samchon/payment-api.svg)](https://www.npmjs.com/package/@samchon/payment-api)
[![Downloads](https://img.shields.io/npm/dm/@samchon/payment-api.svg)](https://www.npmjs.com/package/@samchon/payment-api)

본 프로젝트 `@samchon/payment-backend` 는 연동을 위한 SDK 라이브러리를 제공한다.

귀하는 이 `@samchon/payment-api` 를 통하여, 통합 결제 서버와 매우 손쉽게 연동할 수 있고, 이를 통하여 결제 부문에 관련된 MSA (Micro Service Architecture) 를 매우 안전하게 구성할 수 있다. 

`npm install --save @samchon/payment-api` 명령어를 통하여 통합 결제와의 연동을 위한 SDK 라이브러리를 설치한 후, 아래 매뉴얼 및 예제 코드를 참고하여 귀하의 백엔드 서비스가 필요로 하는 결제 기능을 개발하도록 한다.

  - 서버 접속 정보
    - Host 주소
      - 로컬 서버: http://localhost:37821
      - Dev 서버: https://YOUR-DEV-SERVER
      - Real 서버: https://YOUR-REAL-SERVER
    - 프로토콜: HTTP/S
      - Request/Response Body: Encrypted JSON
      - AES-128/256
      - CBC mode
      - PKCS #5 Padding
      - Base64 Encoding
  - 매뉴얼
    - 자료구조 매뉴얼: [src/api/structures/IPaymentHistory.ts](https://github.com/samchon/payments/tree/master/src/api/structures/IPaymentHistory.ts)
    - API 함수 매뉴얼: [src/api/functional/histories/index.ts](https://github.com/samchon/payments/tree/master/src/api/functional/histories/index.ts)
    - 예제 코드
      - 아임포트
        - 결제 기록하기: [test_fake_iamport_payment_history.ts](https://github.com/samchon/payments/tree/master/src/test/features/fake/examples/test_fake_iamport_payment_history.ts)
        - 간편 결제 등록하기: [test_fake_iamport_payment_reservation.ts](https://github.com/samchon/payments/tree/master/src/test/features/fake/examples/test_fake_iamport_payment_reservation.ts)
        - 웹훅 이벤트 리스닝: [test_fake_iamport_payment_webhook.ts](https://github.com/samchon/payments/tree/master/src/test/features/fake/examples/test_fake_iamport_payment_webhook.ts)
      - 토스 페이먼츠
        - 결제 기록하기: [test_fake_toss_payment_history.ts](https://github.com/samchon/payments/tree/master/src/test/features/fake/examples/test_fake_toss_payment_history.ts)
        - 간편 결제 등록하기: [test_fake_toss_payment_reservation.ts](https://github.com/samchon/payments/tree/master/src/test/features/fake/examples/test_fake_toss_payment_reservation.ts)
        - 웹훅 이벤트 리스닝: [test_fake_toss_payment_webhook.ts](https://github.com/samchon/payments/tree/master/src/test/features/fake/examples/test_fake_toss_payment_webhook.ts)

```typescript
import { TestValidator } from "@nestia/e2e";
import imp from "iamport-server-api";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import PaymentAPI from "@samchon/payment-api";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";
import { IPaymentWebhookHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentWebhookHistory";
import { sleep_for } from "tstl";
import typia from "typia";
import { v4 } from "uuid";

import { PaymentConfiguration } from "../../../src";
import { FakePaymentStorage } from "../../../src/providers/payments/FakePaymentStorage";
import { IamportAsset } from "../../../src/services/iamport/IamportAsset";

export async function test_api_iamport_vbank_payment(
    connection: PaymentAPI.IConnection,
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
     * 아임포트 시뮬레이션.
     *
     * 고객이 프론트 어플리케이션에서, 아임포트가 제공하는 팝업 창을 이용, 가상 계좌
     * 결제를 하는 상황을 시뮬레이션 한다. 고객이 가상 계좌 발급을 마치거든, 프론트
     * 어플리케이션에 {@link IIamportPayment.imp_uid} 가 전달된다.
     *
     * 이 {@link IIamportPayment.imp_uid} 와 귀하의 백엔드에서 직접 생성한
     * {@link IIamportPayment.merchant_uid yourOrderId} 를 잘 기억해두었다가, 이를
     * 다음 단계인 {@link IPaymentHistory} 등록에 사용하도록 하자.
     */
    const payment: IIamportResponse<IIamportPayment> =
        await imp.functional.vbanks.create(
            await IamportAsset.connection("test-iamport-create-id"),
            {
                merchant_uid: yourOrderId,
                amount: yourOrderPrice,
                vbank_code: "SHINHAN",
                vbank_due: Date.now() / 1_000 + 7 * 24 * 60 * 60,
                vbank_holder: "Samchon",
            },
        );
    typia.assert(payment);

    /**
     * 웹훅 URL 설정하기.
     *
     * 웹훅 URL 을 테스트용 API 주소, internal.webhook 으로 설정.
     */
    const webhook_url: string = `http://127.0.0.1:${PaymentConfiguration.API_PORT()}${
        PaymentAPI.functional.payments.internal.webhook.METADATA.path
    }`;

    /**
     * 결제 이력 등록하기.
     *
     * 앞서 아임포트의 팝업 창을 이용하여 가상 계좌 결제를 진행하고 발급받은
     * {@link IIamportPayment.imp_uid}, 그리고 귀하의 백엔드에서 직접 생성한
     * {@link IIamportPayment.merchant_uid yourOrderId} 를 각각
     * {@link IPaymentVendor.uid} 와 {@link IPaymentSource.id} 로 할당하여
     * {@link IPaymentReservation} 레코드를 발행한다.
     *
     * 참고로 결제 이력을 등록할 때 반드시 비밀번호를 설정해야 하는데, 향후 결제 이력을
     * 조회할 때 필요하니, 이를 반드시 귀하의 백엔드 서버에 저장해두도록 한다.
     */
    const history: IPaymentHistory =
        await PaymentAPI.functional.payments.histories.create(connection, {
            vendor: {
                code: "iamport",
                store_id: "test-iamport-create-id",
                uid: payment.response.imp_uid,
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
    await imp.functional.internal.deposit(
        await IamportAsset.connection("test-iamport-create-id"),
        payment.response.imp_uid,
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




## 3. Development
### 3.1. Definition
백엔드 서버에 새 API 를 추가하고 기능을 변경하는 일 따위는 물론, API 컨트롤러, 즉 [src/controllers](src/controllers) 의 코드를 수정함으로써 이루어진다. 하지만 `@samchon/payment-backend` 는 신규 API 가 필요하거나 혹은 기존 API 의 변경 필요할 때, 대뜸 [Main Program](#33-main-program) 의 코드부터 작성하고 보는 것을 매우 지양한다. 그 대신 `@samchon/payment-backend` 는 API 의 인터페이스만을 먼저 정의하고, [Main Program](#33-main-program) 의 구현은 나중으로 미루는 것을 지향한다.

따라서 `@samchon/payment-backend` 에 새 API 를 추가하려거든, [src/controllers](src/controllers) 에 새 API 의 인터페이스만을 먼저 정의해준다. 곧이어 `npm run build:api` 명령어를 통하여, API Library 를 빌드한다. 경우에 따라서는 서비스 서버와의 동시 개발을 위하여, 새로이 빌드된 SDK 를 그대로 `npm run package:api` 해 버려도 좋다. 

이후 로컬에서 새로이 생성된 SDK 와 해당 API 를 이용, 유즈케이스 시나리오를 테스트 자동화 프로그램으로 작성한다. 이후 Main Program 을 제작하며, 앞서 작성해 둔 테스트 자동화 프로그램으로 상시 검증한다. 마지막으로 Main Program 까지 완성되면 이를 배포하면 된다.

이하 `@samchon/payment-backend` 의 개략적인 개발 순서를 요약하면 아래와 같다.

  - API Interface Definition
  - API Library (SDK) 빌드
  - Test Automation Program 제작
  - Main Program 제작 및 테스트 자동화 프로그램을 이용한 상시 검증
  - DEV 및 REAL 서버에 배포

### 3.2. Test Automation Program
[![Build Status](https://github.com/samchon/payments/workflows/build/badge.svg)](https://github.com/samchon/payments/actions?query=workflow%3Abuild)

```bash
npm run test
```

새로이 개발할 [API 인터페이스 정의](#31-api-interface-definition)를 마쳤다면, 그 다음에 할 일은 바로 해당 API 에 대한 유즈케이스 시나리오를 세우고 이를 테스트 자동화 프로그램을 만들어, 향후 [Main Program](#33-main-program) 제작시 이를 상시 검증할 수 있는 수단을 구비해두는 것이다 - TDD (Test Driven Development).

그리고 본 프로젝트는 `npm run test` 라는 명령어를 통하여, 서버 프로그램의 일체 기능 및 정책 등에 대하여 검증할 수 있는, 테스트 자동화 프로그램을 구동해 볼 수 있다. 더불어 테스트 자동화 프로그램은 순수하게 `@samchon/payment-backend` 의 메인 서버 프로그램 뿐 아니라, 통합 결제 서버와 연동하는 다양한 외부 PG 사 시스템들도, 가상으로 구동하게 된다.

  - [fake-iamport-payments-server](https://github.com/samchon/fake-iamport-payments-server)
  - [fake-toss-payments-server](https://github.com/samchon/fake-toss-payments-server)

그리고 만약 새 테스트 로직을 추가하고 싶다면, [src/test/features](src/test/features) 내 적당한 위치에 새 `ts` 파일을 하나 만들고, `test_` 로 시작하는 함수를 하나 만들어 그 안에 테스트 로직을 작성한 후, 이를 `export` 심벌을 이용하여 배출해주면 된다. 이에 대한 자세한 내용은 [src/test/features](src/test/features) 폴더에 들어있는 모든 `ts` 파일 하나 하나가 다 좋은 예제 격이니, 이를 참고하도록 한다.

```typescript
import { v4 } from "uuid";
import { sleep_for } from "tstl";

import imp from "iamport-server-api";
import payments from "../../../../api";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import { IPaymentHistory } from "../../../../api/structures/IPaymentHistory";
import { IPaymentWebhook } from "../../../../api/structures/IPaymentWebhook";

import { FakePaymentStorage } from "../../../../providers/FakePaymentStorage";
import { IamportAsset } from "../../../../services/iamport/IamportAsset";
import { PaymentConfiguration } from "../../../../PaymentConfiguration";

export async function test_fake_iamport_payment_webhook
    (connection: payments.IConnection): Promise<void>
{
     const yourOrderId: string = v4(); // 귀하의 서비스가 발행한 주문 ID.
     const yourOrderPrice: number = 19_900; // 주문 금액

    // 아임포트 가상 계좌 결제 시뮬레이션
    const payment: IIamportResponse<IIamportPayment> = 
        await imp.functional.vbanks.create
        (
            await IamportAsset.connection("test-iamport-create-id"),
            {
                merchant_uid: yourOrderId,
                amount: yourOrderPrice,
                vbank_code: "SHINHAN",
                vbank_due: Date.now() / 1_000 + 7 * 24 * 60 * 60,
                vbank_holder: "남정호"
            }
        );

    // 웹훅 URL 설정하기.
    const webhook_url: string = "http://127.0.0.1:"
        + PaymentConfiguration.API_PORT
        + payments.functional.internal.webhook.PATH;
    
    // 결제 이력 등록하기
    const history: IPaymentHistory = await payments.functional.histories.create
    (
        connection,
        {
            vendor: {
                code: "iamport",
                store_id: "test-iamport-create-id",
                uid: payment.response.imp_uid,
            },
            source: {
                schema: "some-schema",
                table: "some-table",
                id: yourOrderId
            },
            webhook_url, // 테스트용 웹훅 URL
            price: yourOrderPrice,
            password: "some-password",
        }
    );
    
    // 가상 계좌 입금 시뮬레이션
    await imp.functional.internal.deposit
    (
        await IamportAsset.connection("test-iamport-create-id"),
        payment.response.imp_uid
    );

    // 웹훅 이벤트가 귀하의 백엔드 서버로 전달되기를 기다림.
    await sleep_for(100);

    // 웹훅 이벤트 리스닝 시뮬레이션
    const webhook: IPaymentWebhook = FakePaymentStorage.webhooks.back();
    if (webhook.current.id !== history.id)
        throw new Error("Bug on PaymentWebhooksController.iamport(): failed to deliver the webhook event.");
    else if (webhook.previous.paid_at !== null)
        throw new Error("Bug on PaymentWebhookProvider.process(): failed to delivery the exact previous data.");
    else if (webhook.current.paid_at === null)
        throw new Error("Bug on PaymentWebhookProvider.process(): failed to delivery the exact current data.");

    // 웹훅 데이터 삭제
    FakePaymentStorage.webhooks.pop_back();
}
```

### 3.3. Main Program
[API 인터페이스를 정의](#31-api-interface-definition)하고 그에 관련된 [테스트 자동화 프로그램](#32-test-automation-program)을 제작하였다면, 마지막으로 남은 일은 바로 서버의 메인 프로그램을 작성, 해당 API 를 완성하는 것이다. 앞서 정의한 [API 인터페이스](#31-api-interface-definition) 메서드 내에, 상세 구현 코드를 작성하고, 이를 [테스트 자동화 프로그램](#32-test-automation-program)을 통하여 상시 검증하도록 하자.

단, 모든 소스 코드를 전부 API 컨트롤러의 메서드에 작성하는 우는 범하지 않기를 바란다. API 컨트롤러는 단지 매개체 + a 의 역할만을 해야 할 뿐이며, 주 소스 코드는 [src](src) 폴더 내 각 폴더의 분류에 따라 알맞게 나뉘어 작성되어야 한다. 특히, DB 를 통한 데이터 입출력에 관해서는 가급 [src/providers](src/providers) 를 경유하도록 할 것.

더하여 통합 결제 서버의 설정 정보는 모두 [src/PaymentConfiguration.ts](src/PaymentConfiguration.ts) 에 몰아두었으니, 이 설정 정보들을 귀하의 서비스에 알맞게 수정하는 것 또한 잊지 말기 바란다.

### 3.4. Encryption
모든 데이터는 암호화되어 전송되거나 저장된다.

  - 암호화 방식
    - AES-128/256
    - CBC mode
    - PKCS #5 Padding
    - Base64 Encoding

본 통합 결제 서버 `@samchon/payment-backend` 는 보안을 강화하기 위하여, http 프로토콜로 전송되는 모든 `body` 데이터를 암호화한다 이는 `request body` 와 `response body` 양쪽 모두 해당되는 이야기이며, 설사 http 대신 https 프로토콜을 사용한다 하더라도 예외는 없다.

더하여 `@samchon/payment-backend` 는 결제를 비롯한 모든 민감 데이터들을 암호화하여 저장하고 있다. 또한, 각 암호화 항목마다 각기 다른 secret key 및 initialization vector 를 사용함으로써, 보안을 한층 더 강화하고 있다. 그리고 이러한 민감 데이터들은 일괄 조회가 불가능하며, 오직 개별 단위의 조회만 가능하다. 이 개별 단위의 조회조차, 해당 레코드의 비밀번호를 모르면 일절 조회할 수 없다.

`@samchon/payment-backend` 에는 이처럼 보안 강화를 위한 강력한 암호화 정책들이 존재한다. 혹여 귀하가 본 `@samchon/payment-backend` 를 확장하여 몇 가지 기능을 더 개발한다 하더라도, 이러한 암호화 원칙들은 부디 지켜주었으면 한다.

