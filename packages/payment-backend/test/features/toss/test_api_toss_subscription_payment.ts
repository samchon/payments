import api from "@samchon/payment-api";
import { IPaymentReservation } from "@samchon/payment-api/lib/structures/payments/IPaymentReservation";
import { IIamportSubscription } from "iamport-server-api/lib/structures/IIamportSubscription";
import toss from "toss-payments-server-api";
import { ITossBilling } from "toss-payments-server-api/lib/structures/ITossBilling";
import typia from "typia";
import { v4 } from "uuid";

import { TossAsset } from "../../../src/services/toss/TossAsset";

export async function test_api_toss_subscription_payment(
  connection: api.IConnection,
): Promise<void> {
  /**
   * 귀하의 백엔드 서버가 발행한 식별자 ID.
   *
   * 아임포트는 토스 페이먼츠와 달리, 간편 결제로 등록한 카드에 자체 식별자를 부여하지
   * 않는다. 따라서 귀하의 백엔드 서버가 발행한 식별자 ID 가 곧, 해당 간편 결제 등록
   * 내역의 유일무일한 식별자인 셈.
   */
  const yourSourceId: string = v4();

  /* -----------------------------------------------------------
        간편 결제 카드 등록
    ----------------------------------------------------------- */
  /**
   * 토스 페이먼츠 시뮬레이션.
   *
   * 고객이 프론트 어플리케이션에서, 토스 페이먼츠가 제공하는 팝업 창을 이용, 간편 결제
   * 카드를 등록하는 상황을 시뮬레이션을 한다. 고객이 간편 결제 카드 등록을 마치거든,
   * 프론트 어플리케이션에 {@link ITossBilling.billingKey} 가 전달된다.
   *
   * 이 {@link ITossBilling.billingKey} 와 귀하의 백엔드 서버에서 직접 생성한
   * {@link ITossBilling.customerKey yourSourceId} 를 잘 기억해두었다가, 이를 다음
   * 단계인 {@link IPaymentReservation} 등록에 사용하도록 하자.
   */
  const billing: ITossBilling =
    await toss.functional.v1.billing.authorizations.card.store(
      await TossAsset.connection("test-toss-payments-store-id"),
      {
        customerKey: yourSourceId,
        cardNumber: "1111222233334444",
        cardExpirationYear: "28",
        cardExpirationMonth: "03",
        cardPassword: "99",
        customerBirthday: "880311",
        consumerName: "남정호",
      },
    );
  typia.assert(billing);

  /**
   * 간편 결제 수단 등록하기.
   *
   * 아임포트는 간편 결제 수단에 대하여 별도의 식별자 번호를 부여하지 않는다. 따라서
   * 귀하가 발행하였던 {@link IIamportSubscription.customer_uid yourSourceId} 를
   * {@link IPaymentVendor.uid} 와 {@link IPaymentSource.id} 에 모두 동일하게
   * 할당하여 {@link IPaymentReservation} 레코드를 발행한다.
   *
   * 참고로 간편 결제 수단을 등혹할 때 반드시 비밀번호를 설정해야 하는데, 이는 향후
   * 간편 결제 수단을 조회할 때 필요하니, 이를 반드시 귀하의 백엔드 서버에 저장해두도록
   * 한다.
   */
  /**
   * 간편 결제 수단 등록하기.
   *
   * 앞서 토스 페이먼츠의 팝업 창을 이용하여 간편 결제 카드를 등록하고 발급받은
   * {@link ITossBilling.billingKey}, 그리고 귀하의 백엔드 서버에서 직접 생성한
   * {@link ITossBilling.customerKey} 를 각각 {@link IPaymentVendor.uid} 와
   * {@link IPaymentSource.id} 로 할당하여 {@link IPaymentReservation} 레코드를
   * 발행한다.
   *
   * 참고로 간편 결제 수단을 등록할 때 반드시 비밀번호를 설정해야 하는데, 이는 향후 간편
   * 결제 수단을 조회할 때 필요하니, 이를 반드시 귀하의 백엔드 서버에 저장해두도록 한다.
   */
  const reservation: IPaymentReservation =
    await api.functional.payments.reservations.store(connection, {
      vendor: {
        code: "toss.payments",
        store_id: "test-toss-payments-store-id",
        uid: billing.billingKey,
      },
      source: {
        schema: "some-schema",
        table: "some-table",
        id: yourSourceId,
      },
      title: "some-title",
      password: "some-password",
    });
  typia.assert(reservation);

  /* -----------------------------------------------------------
        간편 결제 카드 조회하기
    ----------------------------------------------------------- */
  /**
   * 간편 결제 수단 조회하기 by {@link IPaymentReservation.id}.
   *
   * 앞서 등록한 간편 결제 수단의 상세 정보를 {@link IPaymentReservation.id} 를
   * 이용하여 조회할 수 있다. 다만, 이 때 앞서 간편 결제 수단을 등록할 때 사용했던
   * 비밀번호가 필요하니, 부디 귀하의 백엔드 서버에서 이를 저장하였기 바란다.
   */
  const read: IPaymentReservation =
    await api.functional.payments.reservations.at(connection, reservation.id, {
      password: "some-password",
    });
  typia.assert(read);

  // if condition 과 vendor_code 를 이용해 하위 타입을 특정할 수 있다.
  if (read.vendor_code === "toss.payments") read.data.billingKey;

  /**
   * 간편 결제 수단 조회하기 by {@link IPaymentSource}.
   *
   * 앞서 등록한 간편 결제 수단의 상세 정보는 {@link IPaymentSource} 를 통하여도
   * 조회할 수 있다. 다만, 이 때 앞서 간편 결제 수단을 등록할 때 사용햇던 비밀번호가
   * 필요하니, 부디 귀하의 백엔드 서버에서 이를 저장하였기 바란다.
   */
  const gotten: IPaymentReservation =
    await api.functional.payments.reservations.get(connection, {
      schema: "some-schema",
      table: "some-table",
      id: yourSourceId,
      password: "some-password",
    });
  typia.assert(gotten);

  // if condition 과 vendor_code 를 이용해 하위 타입을 특정할 수 있다.
  if (gotten.vendor_code === "toss.payments") gotten.data.cardNumber;
}
