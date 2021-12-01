# Fake Toss Payments Server
## 1. Outline
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/fake-toss-payments-server/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/toss-payments-server-api.svg)](https://www.npmjs.com/package/toss-payments-server-api)
[![Downloads](https://img.shields.io/npm/dm/toss-payments-server-api.svg)](https://www.npmjs.com/package/toss-payments-server-api)
[![Build Status](https://github.com/samchon/fake-toss-payments-server/workflows/build/badge.svg)](https://github.com/samchon/fake-toss-payments-server/actions?query=workflow%3Abuild)

`fake-toss-payments-server` 는 토스 페이먼츠 서버의 API 를 흉내내어 만든, 가짜 토스 페이먼츠 서버이다. 토스 페이먼츠 서버와의 보다 원활한 연동 테스트를 위하여 만들었다. 특히 프론트 어플리케이션을 통한 수기 테스트가 아닌, 백엔드 서버 자체의 테스트 자동화 프로그램을 통한 상시 검증에 적합하다.

또한, [toss-payments-server-api](https://www.npmjs.com/package/toss-payments-server-api) 는 토스 페이먼츠 서버와 연동할 수 있는 SDK 라이브러리로써, `fake-toss-payments-server` 의 소스코드를 토대로 [Nestia](https://github.com/samchon/nestia) 를 이용하여 빌드하였다. 그리고 이를 통하여 가짜 토스 페이먼츠 서버 뿐 아니라, 진짜 토스 페이먼츠 서버, 양쪽 모두와 연동할 수 있다.

  - 자료 구조 매뉴얼: [src/api/structures/ITossBilling.ts](https://github.surf/samchon/fake-toss-payments-server/blob/HEAD/src/api/structures/ITossBilling.ts)
  - API 함수 매뉴얼: [src/api/functional/payments/index.ts](https://github.surf/samchon/fake-toss-payments-server/blob/HEAD/src/api/functional/payments/index.ts)
  - 예제 코드
    - 간편 결제: [src/test/features/examples/test_fake_billing_payment.ts](https://github.surf/samchon/fake-toss-payments-server/blob/HEAD/src/test/features/examples/test_fake_billing_payment.ts)
    - 카드 결제: [src/test/features/examples/test_fake_card_payment.ts](https://github.surf/samchon/fake-toss-payments-server/blob/HEAD/src/test/features/examples/test_fake_card_payment.ts)
    - 가상 계좌 결제: [src/test/features/examples/test_fake_virtual_account_payment.ts](https://github.surf/samchon/fake-toss-payments-server/blob/HEAD/src/test/features/examples/test_fake_virtual_account_payment.ts)

```typescript
import btoa from "btoa";
import toss from "toss-payments-server-api";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { assertType } from "typescript-is";

export async function test_fake_card_payment_approval(): Promise<void>
{
    const connection: toss.IConnection = {
        host: "http://127.0.0.1:30771", // FAKE-SERVER
        // host: "https://api.tosspayments.com/v1", // REAL-SERVER
        headers: {
            Authorization: `Basic ${btoa("test_ak_ZORzdMaqN3wQd5k6ygr5AkYXQGwy")}`
        }
    };

    const payment: ITossPayment = await toss.functional.payments.key_in
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
    assertType<ITossPayment>(payment);

    const approved: ITossPayment = await toss.functional.payments.approve
    (
        connection,
        payment.paymentKey,
        {
            orderId: payment.orderId,
            amount: payment.amount,
        }
    );
    assertType<ITossPayment>(approved);
}
```




## 2. Installation
### 2.1. NodeJS
백엔드 서버 프로그램은 TypeScript 로 만들어졌으며, NodeJS 에서 구동된다. 

고로 제일 먼저 할 일은, NodeJS 를 설치하는 것이다. 아래 링크를 열어, NodeJS 프로그램을 다운로드 받은 후 즉각 설치하기 바란다. 참고로 NodeJS 버전은 어지간히 낮은 옛 시대의 버전만 아니면 되니, 구태여 Latest 버전을 설치할 필요는 없으며, Stable 버전만으로도 충분하다.

  - https://nodejs.org/en/

### 2.2. Server
NodeJS 의 설치가 끝났다면, 바로 (가짜) 토스 페이먼츠 서버 구동을 시작할 수 있다. 

제일 먼저 `git clone` 을 통하여, 백엔드 프로젝트를 로컬 저장소에 복사하도록 한다. 그리고 해당 폴더로 이동하여 `npm install` 명령어를 실행함으로써, 백엔드 서버를 구동하는 데 필요한 라이브러리들을 다운로드 한다. 그리고 `npm run build` 명령어를 입력하여, 백엔드 서버의 소스 코드를 컴파일한다.

마지막으로 `npm run start` 명령어를 실행해주면, (가짜) 토스 페이먼츠 서버가 구동된다. 이 가짜 서버를 통하여, 귀하가 개발하는 백엔드 서버가 결제 연동에 관련하여 제대로 구현되었는 지 충분히 검증한 후, 실 서버를 배포할 때 연동 대상 서버를 현재의 가짜 서버에서 진짜 서버로 바꾸어주도록 하자. 구동 중인 가짜 토스 페이먼츠 서버를 중단하고 싶다면, `npm run stop` 명령어를 실행해주면 된다. 

참고로 가짜 토스 페이먼츠 서버가 사용하는 포트 번호나, 가짜 토스 페이먼츠 서버가 이벤트를 전달해주는 Webhook URL 등은 모두 [src/Configuration.ts](https://github.com/samchon/fake-toss-payments-server/blob/master/src/Configuration.ts) 에 정의되어있으니, 이를 알맞게 수정한 후 컴파일 및 가짜 서버 재 가동을 해 주면 된다.

```bash
# CLONE REPOSITORY
git clone https://github.com/samchon/fake-toss-payments-server
cd fake-toss-payments-server

# INSTALLATION & COMPILATION
npm install
npm run build

# START SERVER & STOP SERVER
npm run start
npm run stop
```

[![npm version](https://badge.fury.io/js/fake-toss-payments-server.svg)](https://www.npmjs.com/package/fake-toss-payments-server)
[![Downloads](https://img.shields.io/npm/dm/fake-toss-payments-server.svg)](https://www.npmjs.com/package/fake-toss-payments-server)

더하여 `fake-toss-payments-server` 는 npm 모듈로 설치하여 구동할 수도 있다.

귀하의 백엔드 서버 테스트 자동화 프로그램이, `fake-toss-payments-server` 의 설정과 개설 및 폐쇄를 모두 통제하고자 할 때는, github 저장소를 clone 하는 것보다, 이처럼 npm 모듈을 설치하여 import 하는 것이 훨씬 더 알맞다.

따라서 귀하의 백엔드 서버가 TypeScript 내지 JavaScript 를 사용한다면, github 저장소를 clone 하여 `fake-toss-payments-server` 를 별도 구동하기보다, 귀하의 백엔드 서버에서 `fake-toss-payments-server` 의 개설과 폐쇄를 직접 통제하기를 권장한다.

```typescript
// npm install --save-dev fake-toss-payments-server
import FakeToss from "fake-toss-payments-server";

async function main(): Promise<void>
{
    FakeToss.Configuration.WEBHOOK_URL = "your-backend-webhook-api-url";
    FakeToss.Configuration.authorize = token => 
    {
        return token === "test_ak_ZORzdMaqN3wQd5k6ygr5AkYXQGwy";
    };

    const fake: FakeToss.Backend = new FakeToss.Backend();
    await fake.open();
    await fake.close();
}
```

### 2.3. SDK
[![npm version](https://badge.fury.io/js/toss-payments-server-api.svg)](https://www.npmjs.com/package/toss-payments-server-api)
[![Downloads](https://img.shields.io/npm/dm/toss-payments-server-api.svg)](https://www.npmjs.com/package/toss-payments-server-api)

본 백엔드 프로젝트 `fake-toss-payments-server` 는 비록 토스 페이먼츠의 API 를 흉내내어 만든 가짜이지만, 이것을 통하여 만들어지는 SDK (Software Development Kit) 만큼은 진짜이다. 이 SDK 를 이용하면, `fake-toss-payments-server` 뿐 아니라 진짜 토스 페이먼츠 서버와도 원활히 연동할 수 있기 때문이다.

고로 토스 페이먼츠와 연동하는 TypeScript 기반 백엔드 서버를 개발함에 있어, 가짜 토스 페이먼츠 서버 `fake-toss-payments-server` 는 직접 이용치 않더라도, 실제 토스 페이먼츠 서버와의 연동을 위하여, SDK 라이브러리만큼은 반드시 설치하기를 권장하는 바이다.

```bash
npm install --save fake-toss-payments-server-api
```

먼저 위 명령어를 통하여, 귀하의 TypeScript 기반 백엔드 서버에, 토스 페이먼츠 서버와의 연동을 위한 SDK 라이브러리를 설치한다. 그리고 가짜 토스 페이먼츠 서버 `fake-toss-payments-server` 를 구동하여, 이 것과의 결제 연동이 제대로 이루어지는 지 충분할 만큼의 검증을 한다. 테스트 자동화 프로그램을 제작, 이 안정성이 상시 검증될 수 있다면 더더욱 좋다. 

마지막으로 실 서버를 배포하며, 연동 대상 서버를 가짜에서 진짜로 교체해주면 된다.

  - 자료 구조 매뉴얼: [src/api/structures/ITossBilling.ts](https://github.surf/samchon/fake-toss-payments-server/blob/HEAD/src/api/structures/ITossBilling.ts)
  - API 함수 매뉴얼: [src/api/functional/payments/index.ts](https://github.surf/samchon/fake-toss-payments-server/blob/HEAD/src/api/functional/payments/index.ts)
  - 예제 코드
    - 간편 결제: [src/test/features/examples/test_fake_billing_payment.ts](https://github.surf/samchon/fake-toss-payments-server/blob/HEAD/src/test/features/examples/test_fake_billing_payment.ts)
    - 카드 결제: [src/test/features/examples/test_fake_card_payment.ts](https://github.surf/samchon/fake-toss-payments-server/blob/HEAD/src/test/features/examples/test_fake_card_payment.ts)
    - 가상 계좌 결제: [src/test/features/examples/test_fake_virtual_account_payment.ts](https://github.surf/samchon/fake-toss-payments-server/blob/HEAD/src/test/features/examples/test_fake_virtual_account_payment.ts)

```typescript
import btoa from "btoa";
import toss from "toss-payments-server-api";
import { ITossBilling } from "toss-payments-server-api/lib/structures/ITossBilling";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { assertType } from "typescript-is";

export async function test_fake_payment_billing_payment(): Promise<void>
{
    const connection: toss.IConnection = {
        host: "http://127.0.0.1:30771", // FAKE-SERVER
        // host: "https://api.tosspayments.com/v1", // REAL-SERVER
        headers: {
            Authorization: `Basic ${btoa("test_ak_ZORzdMaqN3wQd5k6ygr5AkYXQGwy")}`
        }
    };

    const billing: ITossBilling = await toss.functional.billing.authorizations.card.store
    (
        connection,
        {
            customerKey: "some-consumer-key",
            cardNumber: "1111222233334444",
            cardExpirationYear: "28",
            cardExpirationMonth: "03",
            cardPassword: "99",
            customerBirthday: "880311",
            consumerName: "남정호"
        }
    );
    assertType<ITossBilling>(billing);

    const payment: ITossPayment = await toss.functional.billling.pay
    (
        connection,
        billing.billingKey,
        {
            method: "billing",
            billingKey: billing.billingKey,
            customerKey: "some-consumer-key",
            orderId: "some-order-id",
            amount: 10_000
        });
    );
    assertType<ITossPayment>(payment);
}
```




## 3. Development
### 3.1. API Interface Definition
백엔드 서버에 새 API 를 추가하고 기능을 변경하는 일 따위는 물론, API 컨트롤러, 즉 [src/controllers](https://github.com/samchon/fake-toss-payments-server/blob/master/src/controllers) 의 코드를 수정함으로써 이루어진다. 하지만 `fake-toss-payments-server` 는 신규 API 가 필요하거나 혹은 기존 API 의 변경 필요할 때, 대뜸 [Main Program](#33-main-program) 의 코드부터 작성하고 보는 것을 매우 지양한다. 그 대신 `fake-toss-payments-server` 는 API 의 인터페이스만을 먼저 정의하고, [Main Program](#33-main-program) 의 구현은 나중으로 미루는 것을 지향한다.

따라서 `fake-toss-payments-server` 에 새 API 를 추가하려거든, [src/controllers](https://github.com/samchon/fake-toss-payments-server/blob/master/src/controllers) 에 새 API 의 인터페이스만을 먼저 정의해준다. 곧이어 `npm run sdk` 나 `npm run api` 명령어를 통하여, API Library 를 빌드한다. 경우에 따라서는 프론트 프로젝트와의 동시 개발을 위하여, 새로이 빌드된 SDK 를 그대로 `npm publish` 해 버려도 좋다. 

이후 로컬에서 새로이 생성된 SDK 와 해당 API 를 이용, 유즈케이스 시나리오를 테스트 자동화 프로그램으로 작성한다. 그리고 Main Program 을 제작하며, 앞서 작성해 둔 테스트 자동화 프로그램으로 상시 검증한다. 마지막으로 Main Program 까지 완성되면 이를 배포하면 된다.

이하 `fake-toss-payments-server` 의 개략적인 개발 순서를 요약하면 아래와 같다.

  - API Interface Definition
  - API Library (SDK) 빌드
  - Test Automation Program 제작
  - Main Program 제작 및 테스트 자동화 프로그램을 이용한 상시 검증
  - DEV 및 REAL 서버에 배포

### 3.2. Test Automation Program
```bash
npm run test
```

새로이 개발할 [API 인터페이스 정의](#31-api-interface-definition)를 마쳤다면, 그 다음에 할 일은 바로 해당 API 에 대한 유즈케이스 시나리오를 세우고 이를 테스트 자동화 프로그램을 만들어, 향후 [Main Program](#33-main-program) 제작시 이를 상시 검증할 수 있는 수단을 구비해두는 것이다 - TDD (Test Driven Development).

그리고 본 프로젝트는 `npm run test` 라는 명령어를 통하여, 서버 프로그램의 일체 기능 및 정책 등에 대하여 검증할 수 있는, 테스트 자동화 프로그램을 구동해 볼 수 있다. 만약 새로운 테스트 로직을 추가하고 싶다면, [src/test/features](https://github.com/samchon/fake-toss-payments-server/blob/master/src/test/features) 폴더의 적당한 위치에 새 `ts` 파일을 하나 만들고, `test_` 로 시작하는 함수를 하나 만들어 그 안에 테스트 로직을 작성한 후, 이를 `export` 심벌을 이용하여 배출해주면 된다. 이에 대한 자세한 내용은 [src/test/features](https://github.com/samchon/fake-toss-payments-server/blob/master/src/test/features) 폴더에 들어있는 모든 `ts` 파일 하나 하나가 다 좋은 예제 격이니, 이를 참고하도록 한다.

참고로 `npm run test` 명령어를 실행할 때마다, [src/test/features](https://github.com/samchon/fake-toss-payments-server/blob/master/src/test/features) 폴더 내에 등록된 모든 프로그램을 실행하게 된다. 하지만 이런 식의 *entire level test* 가 매번 필요한 것은 아닐 것이다. 새로 개발한 기능이 극히 일부 요소에 국한되어 부분 테스트가 필요하다면, 아래 옵션값을 참조, `--include` 나 `--exclude` 태그를 사용하여 시간을 절약하도록 하자.

  - options
    - `include`: 특정 단어가 포함된 테스트 함수만 실행
    - `exclude`: 특정 단어가 포함된 테스트 함수 제외

### 3.3. Main Program
[API 인터페이스를 정의](#31-api-interface-definition)하고 그에 관련된 [테스트 자동화 프로그램](#32-test-automation-program)을 제작하였다면, 마지막으로 남은 일은 바로 서버의 메인 프로그램을 작성, 해당 API 를 완성하는 것이다. 앞서 정의한 [API 인터페이스](#31-api-interface-definition) 메서드 내에, 상세 구현 코드를 작성하고, 이를 [테스트 자동화 프로그램](#32-test-automation-program)을 통하여 상시 검증하도록 하자.

단, 모든 소스 코드를 전부 API 컨트롤러의 메서드에 작성하는 우는 범하지 않기를 바란다. API 컨트롤러는 단지 매개체 + a 의 역할만을 해야 할 뿐이며, 주 소스 코드는 [src](src) 폴더 내 각 폴더의 분류에 따라 알맞게 나뉘어 작성되어야 한다.




## 4. Appendix
### 4.1. Nestia
Automatic SDK generator for the NestJS.

  - https://github.com/samchon/nestia

Nesita 는 NestJS 로 만든 백엔드 서버 프로그램을 컴파일러 수준에서 분석, 클라이언트가 사용할 수 있는 SDK 라이브러리를 만들어주는 프로그램이다. `fake-toss-payments-server` 가 토스 페이먼츠의 API 를 흉내내어 만든 가짜 서버인데, 뜬금 클라이언트가 진짜 토스 페이먼츠와의 연동에 사용할 수 있는 SDK 라이브러리가 함께 제공되는 이유도 바로 이 덕분이다.

때문에 만일 귀하가 토스 페이먼츠와 연동하는 백엔드 서버를 개발 중이라면, `fake-toss-payments-server` 뿐 아니라 [Nestia](https://github.com/samchon/nestia) 도 함께 사용해보는 것이 어떠한가? 귀하의 백엔드 서버 또한 `fake-toss-payments-server` 처럼 클라이언트 개발자가 사용할 수 있는 SDK 라이브러리를 자동으로 빌드하여 배포할 수 있으니, 백엔드 개발자는 API 문서를 따로 만들고 클라이언트 개발자는 중복 DTO 타입과 API 연동 함수를 개발하는 등의 번거로운 일을 일절 하지 않아도 된다.

### 4.2. Expiration
`fake-toss-payments-server` 는 결제 데이터를 메모리에 임시 기록한다.

왜냐하면 `fake-toss-payments-server` 는 토스 페이먼츠 서버의 API 를 흉내내어 만든 가짜 서버로써, 개발 단계에서 쓰이는 임시 시스템에 불과하기 때문이다. 따라서 `fake-toss-payments-server` 에 생성된 결제 내지 카드 정보들은 모두 테스트 용도로 생성된 임시 레코드가 불과하기에, 구태여 이를 DB 나 로컬 디스크에 저장하여 영구 보존할 이유가 없다.

이에 `fake-toss-payments-server` 는 결제 데이터를 메모리에 임시로 기록하며, 한 편으로 그 수량 및 보존 기한에 한도를 두어, 쉬이 메모리 부족 현상이 일어나지 않도록 하고 있다. 이러한 임시 데이터 만료 정보는 [src/Configuration.ts](https://github.com/samchon/fake-toss-payments-server/blob/master/src/Configuration.ts) 파일의 `EXPIRATION` 변수에 정의되어있으며, 결제 및 간편 카드 결제 등록 데이터는 모두 [src/providers/FakeTossStorage.ts](https://github.com/samchon/fake-toss-payments-server/blob/master/src/providers/FakeTossStorage.ts) 에서 관리된다.

  - 임시 데이터 만료 정보: [src/Configuration.ts](https://github.com/samchon/fake-toss-payments-server/blob/master/src/Configuration.ts)
  - 임시 데이터 저장소: [src/providers/FakeTossStorage.ts](https://github.com/samchon/fake-toss-payments-server/blob/master/src/providers/FakeTossStorage.ts)
  - 임시 데이터 컨테이너: [src/utils/VolatileMap.ts](https://github.com/samchon/fake-toss-payments-server/blob/master/src/utils/VolatileMap.ts)

> 혹여 `fake-toss-payments-server` 를 사용하는 백엔드 시스템이 제법 크고 그 네트워크 환경 구성이 매우 복잡하여, `fake-toss-payments-server` 를 독립 서버로 배포하고, 가상의 결제 레코드 또한 DB 에 저장해야 하며, 무중단 배포 시스템 또한 필요하지 않을까?
>
> 설마 위와 같은 경우가 있어봐야 얼마나 있겠나 싶어 공개 저장소에 올려두지는 않았으나, `fake-toss-payments-server` 가 결제 데이터를 [VolatileMap](https://github.com/samchon/fake-toss-payments-server/blob/master/src/utils/VolatileMap.ts) 이 아닌 DB 에 저장하고, [폐쇄망에서조차 동작할 수 있는 무중단 업데이트 및 배포 시스템](https://github.com/samchon/backend#41-non-distruptive-update-system)을 따로 구비해 둔 것이 있다.
>
> 따라서 위와 같은 형태의 `fake-toss-payments-server` 가 필요하다면, 얼마든지 연락하기 바란다. 즉시 위 요소를 충당하는 솔루션을 공급해 줄 수 있으며, 만일 이러한 요청이 제법 많은 경우, 별도의 브랜치를 만들어 배포해 볼 요량도 있다.
>
>> ```bash
>> # WHEN STARTING THE MASTE SERVER
>> npm run start:updator:master
>> npm run start
>> 
>> # WHEN STARTING A SLAVE SERVER
>> npm run start:updator:slave
>> npm run start
>> 
>> # WHEN RUN UPDATE COMMAND IN THE CLIENT SIDE
>> npm run update
>> ```

### 4.3. Archidraw
https://www.archisketch.com/

I have special thanks to the Archidraw, where I'm working for.

The Archidraw is a great IT company developing 3D interior editor and lots of solutions based on the 3D assets. Also, the Archidraw is the first company who had adopted `fake-toss-payments-server` on their commercial backend project, even `fake-toss-payments-server` was in the alpha level.