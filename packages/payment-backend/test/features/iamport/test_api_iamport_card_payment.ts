import PaymentAPI from "@samchon/payment-api";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";
import imp from "iamport-server-api";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import typia from "typia";
import { v4 } from "uuid";

import { PaymentConfiguration } from "../../../src";
import { IamportAsset } from "../../../src/services/iamport/IamportAsset";

export async function test_api_iamport_card_payment(
  connection: PaymentAPI.IConnection,
): Promise<IPaymentHistory.IamportType> {
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
  const yourOrderPrice: number = 20_000;

  /* -----------------------------------------------------------
        결제 내역 등록
    ----------------------------------------------------------- */
  /**
   * 아임포트 시뮬레이션
   *
   * 고객이 프론트 어플리케이션에서, 아임포트가 제공하는 팝업 창을 이용, 카드 결제를
   * 하는 상황을 시뮬레이션 한다. 고객이 카드 결제를 마치거든, 프론트 어플리케이션에
   * {@link IIamportPayment.imp_uid} 가 전달된다.
   *
   * 이 {@link IIamportPayment.imp_uid} 와 귀하의 백엔드에서 직접 생성한
   * {@link ITossPayment.orderId yourOrderId} 를 잘 기억해두었다가, 이를 다음 단계인
   * {@link IPaymentHistory} 등록에 사용하도록 하자.
   */
  const payment: IIamportResponse<IIamportPayment> =
    await imp.functional.subscribe.payments.onetime(
      await IamportAsset.connection("test-iamport-store-id"),
      {
        card_number: "1234-1234-1234-1234",
        expiry: "2028-12",
        birth: "880311",

        merchant_uid: yourOrderId,
        amount: yourOrderPrice,
        name: "Fake 주문",
      },
    );
  typia.assert(payment);

  /**
   * 결제 이력 등록하기.
   *
   * 앞서 아임포트의 팝업 창을 이용하여 카드 결제를 진행하고 발급받은
   * {@link IIamportPayment.imp_uid}, 그리고 귀하의 백엔드에서 직접 생성한
   * {@link IIamportPayment.merchant_uid yourOrderId} 를 각각
   * {@link IPaymentVendor.uid} 와 {@link IPaymentSource.id} 로 할당하여
   * {@link IPaymentReservation} 레코드를 발행한다.
   *
   * 참고로 결제 이력을 등록할 때 반드시 비밀번호를 설정해야 하는데, 향후 결제 이력을
   * 조회할 때 필요하니, 이를 반드시 귀하의 백엔드 서버에 저장해두도록 한다.
   */
  const history: IPaymentHistory =
    await PaymentAPI.functional.payments.histories.store(connection, {
      vendor: {
        code: "iamport",
        store_id: "test-iamport-store-id",
        uid: payment.response.imp_uid,
      },
      source: {
        schema: "some-schema",
        table: "some-table",
        id: yourOrderId,
      },
      webhook_url: `http://127.0.0.1:${PaymentConfiguration.API_PORT()}${
        PaymentAPI.functional.payments.internal.webhook.METADATA.path
      }`,
      price: yourOrderPrice,
      password: "some-password",
    });
  typia.assert(history);

  /* -----------------------------------------------------------
        결제 내역 조회하기
    ----------------------------------------------------------- */
  /**
   * 결제 내역 조회하기 by {@link IPaymentHistory.id}.
   *
   * 앞서 등록한 결제 이력의 상세 정보를 {@link IPaymentHistory.id} 를 이용하여 조회할
   * 수 있다. 하지만, 이 때 앞서 결제 이력을 등록할 때 사용했던 비밀번호가 필요하니, 부디
   * 귀하의 백엔드 서버에서 이를 저장하였기 바란다.
   */
  const read: IPaymentHistory =
    await PaymentAPI.functional.payments.histories.at(connection, history.id, {
      password: "some-password",
    });
  typia.assert(read);
  if (read.vendor_code === "iamport") read.data.imp_uid; // if condition 을 통한 하위 타입 특정

  /**
   * 결제 내역 조회하기 by {@link IPaymentSource}.
   *
   * 앞서 등록한 결제 이력의 상세 정보는 {@link IPaymentSource} 를 통하여도 조회할 수
   * 있다. 다만, 이 때 앞서 결제 이력을 등록할 때 사용했던 비밀번호가 필요하니, 부디
   * 귀하의 백엔드 서버에서 이를 저장하였기 바란다.
   */
  const gotten: IPaymentHistory =
    await PaymentAPI.functional.payments.histories.get(connection, {
      schema: "some-schema",
      table: "some-table",
      id: yourOrderId,
      password: "some-password",
    });
  typia.assert(gotten);
  if (gotten.vendor_code === "iamport") gotten.data.imp_uid; // if condition 을 통한 하위 타입 특정

  return typia.assert<IPaymentHistory.IamportType>(gotten);
}
