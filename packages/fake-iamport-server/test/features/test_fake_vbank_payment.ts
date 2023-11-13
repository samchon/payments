import { TestValidator } from "@nestia/e2e";
import imp from "iamport-server-api";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import { IIamportVBankPayment } from "iamport-server-api/lib/structures/IIamportVBankPayment";
import typia from "typia";
import { v4 } from "uuid";

import { FakeIamportStorage } from "../../src/providers/FakeIamportStorage";
import { AdvancedRandomGenerator } from "../../src/utils/AdvancedRandomGenerator";

export async function test_fake_vbank_payment(
  connector: imp.IamportConnector,
): Promise<IIamportVBankPayment> {
  // 가상 결제 발행하기
  const ready: IIamportVBankPayment = await issue(connector);

  // 입금 시뮬레이션
  return deposit(connector, ready);
}

async function issue(
  connector: imp.IamportConnector,
): Promise<IIamportVBankPayment> {
  /**
   * 가상 계좌로 결제 요청하기.
   *
   * 가상 계좌란 결국 무통장 입금의 일환, 고로 즉시 결제가 완료되는 것이 아니다.
   *
   * 향후 고객이 결제 금액을 모두 입금하기 전까지, `ready` 상태가 계속된다.
   */
  const output: IIamportResponse<IIamportVBankPayment> =
    await imp.functional.vbanks.store(await connector.get(), {
      merchant_uid: v4(),
      amount: 40_000,
      vbank_code: AdvancedRandomGenerator.alphabets(8),
      vbank_due: Date.now() / 1000 + 7 * 24 * 60 * 60,
      vbank_holder: AdvancedRandomGenerator.name(),
    });
  typia.assert(output);
  TestValidator.equals("status")(output.response.status)("ready");

  /**
   * 아임포트 서버로부터의 웹훅 데이터.
   *
   * 다만 이 때 보내주는 정보는 최소한의 식별자 및 상태값 정보로써, 해당 결제 건에
   * 대하여 자세히 알고 싶다면, {@link payments.at} API 함수를 호출해야 한다.
   */
  const webhook: IIamportPayment.IWebhook = FakeIamportStorage.webhooks.back();
  TestValidator.equals("imp_uid")(webhook.imp_uid)(output.response.imp_uid);
  TestValidator.equals("status")(webhook.status)("ready");

  /**
   * 결제 내역 조회하기.
   *
   * 위에서 발행한 가상 계좌 신청 내역 및 웹훅 이벤트 데이터를 토대로, 아임포트
   * 서버로부터 {@link payments.at} API 함수를 호출하여 재 조회해보면, 가상 계좌가
   * 무사히 발급되었음을, 그리고 고객이 입금해야 할 가상 계좌 정보가 완전하게
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
  const payment: IIamportVBankPayment = typia.assert<IIamportVBankPayment>(
    reloaded.response,
  );
  TestValidator.equals("imp_uid")(payment.imp_uid)(output.response.imp_uid);
  TestValidator.equals("status")(payment.status)("ready");

  // FOR THE NEXT STEP
  return payment;
}

async function deposit(
  connector: imp.IamportConnector,
  ready: IIamportVBankPayment,
): Promise<IIamportVBankPayment> {
  /**
   * 입금 시뮬레이션.
   *
   * 고객이 자신 앞으로 발급된 가상 계좌에, 결제 금액을 입금함.
   *
   * 이 API 함수는 오직 `fake-iamport-server` 에만 존재하는 테스트용 함수.
   */
  await imp.functional.internal.deposit(await connector.get(), ready.imp_uid);

  /**
   * 아임포트 서버로부터의 웹훅 데이터.
   *
   * 다만 이 때 보내주는 정보는 최소한의 식별자 및 상태값 정보로써, 해당 결제 건에
   * 대하여 자세히 알고 싶다면, {@link payments.at} API 함수를 호출해야 한다.
   */
  const webhook: IIamportPayment.IWebhook = FakeIamportStorage.webhooks.back();
  TestValidator.equals("imp_uid")(webhook.imp_uid)(ready.imp_uid);
  TestValidator.equals("status")(webhook.status)("paid");

  /**
   * 결제 내역 조회하기.
   *
   * 위에서 발행한 가상 계좌 신청 내역 및 웹훅 이벤트 데이터를 토대로, 아임포트
   * 서버로부터 {@link payments.at} API 함수를 호출하여 재 조회해보면, 고객이
   * 가상계좌에 입금을 완료하여, 결제가 완료되었음을 알 수 있다.
   */
  const reloaded: IIamportResponse<IIamportPayment> =
    await imp.functional.payments.at(
      await connector.get(),
      webhook.imp_uid,
      {},
    );
  typia.assert(reloaded);

  // 결제 방식 및 완료 여부 확인
  const payment: IIamportVBankPayment = typia.assert<IIamportVBankPayment>(
    reloaded.response,
  );
  TestValidator.equals("imp_uid")(payment.imp_uid)(reloaded.response.imp_uid);
  TestValidator.equals("status")(payment.status)("paid");
  return payment;
}
