import { TestValidator } from "@nestia/e2e";
import imp from "iamport-server-api";
import { IIamportCardPayment } from "iamport-server-api/lib/structures/IIamportCardPayment";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import typia from "typia";
import { v4 } from "uuid";

import { FakeIamportStorage } from "../../src/providers/FakeIamportStorage";
import { AdvancedRandomGenerator } from "../../src/utils/AdvancedRandomGenerator";

export async function test_fake_card_payment(
    connector: imp.IamportConnector,
): Promise<IIamportCardPayment> {
    /**
     * 결제 요청 레코드 발행하기.
     *
     * 아임포트의 경우 {@link subscribe.payments.onetime} 을 이용하면, API 만을
     * 가지고도 카드 결제를 진행할 수 있다. 그리고 이 때, *input* 값에서
     * {@link IIamportSubscription.IOnetime.customer_uid} 를 빼 버리면, 해당 카드가
     * 간편 결제용으로 등록되지도 아니함.
     *
     * 반대로 *input* 값에 {@link IIamportSubscription.IOnetime.customer_uid} 값을
     * 채워넣으면, 결제가 완료됨과 동시에 해당 카드가간편 결제용으로 등록된다.
     */
    const reply: IIamportResponse<IIamportCardPayment> =
        await imp.functional.subscribe.payments.onetime(await connector.get(), {
            card_number: AdvancedRandomGenerator.cardNumber(),
            expiry: "2028-12",
            birth: "880311",

            merchant_uid: v4(),
            amount: 25_000,
            name: "Fake 주문",
        });
    typia.assert(reply);

    /**
     * 아임포트 서버로부터의 웹훅 데이터.
     *
     * 다만 이 때 보내주는 정보는 최소한의 식별자 및 상태값 정보로써, 해당 결제 건에
     * 대하여 자세히 알고 싶다면, {@link payments.at} API 함수를 호출해야 한다.
     */
    const webhook: IIamportPayment.IWebhook =
        FakeIamportStorage.webhooks.back();
    TestValidator.equals("webhook.imp_uid")(webhook.imp_uid)(
        reply.response.imp_uid,
    );
    TestValidator.equals("webhook.merchant_uid")(webhook.merchant_uid)(
        reply.response.merchant_uid,
    );
    TestValidator.equals("webhook.status")(webhook.status)("paid");

    /**
     * 결제 내역 조회하기.
     *
     * 위에서 발행한 카드 결제 내역 및 웹훅 이벤트 데이터를 토대로, 아임포트 서버로부터
     * {@link payments.at} API 함수를 호출하여 재 조회해보면, 카드 결제가 무사히
     * 완료되었음을, 그리고 관련 결제 정보 {@link IIamportCardPayment} 정보가 완전하게
     * 구성되었음을 알 수 있다.
     */
    const reloaded: IIamportResponse<IIamportPayment> =
        await imp.functional.payments.at(
            await connector.get(),
            webhook.imp_uid,
            {},
        );
    typia.assert(reloaded);

    // 결제 방식 및 완료 여부 확인
    const payment: IIamportCardPayment = typia.assert<IIamportCardPayment>(
        reloaded.response,
    );
    TestValidator.predicate("paid")(
        () => payment.status === "paid" && payment.paid_at !== 0,
    );
    return payment;
}
