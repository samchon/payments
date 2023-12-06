import { IIamportSubscription } from "iamport-server-api/lib/structures/IIamportSubscription";
import { ITossBilling } from "toss-payments-server-api/lib/structures/ITossBilling";
import { tags } from "typia";

import { IPaymentSource } from "./IPaymentSource";
import { IPaymentVendor } from "./IPaymentVendor";

/**
 * 간편 결제 수단 정보.
 *
 * `IPaymentReservation` 은 간편 결제 수단을 형상화한 자료구조이자 유니언 타입의
 * 인터페이스로써, if condition 을 통하여 {@link IPaymentReservation.vendor_code} 값을
 * 특정하면, 파생 타입이 자동으로 다운 캐스팅 된다.
 *
 * ```typescript
 * if (history.vendor_code === "toss.payments")
 *     history.data.billingKey; // history.data be ITossBilling
 * ```
 *
 * @author Samchon
 */
export type IPaymentReservation =
  | IPaymentReservation.IamportType
  | IPaymentReservation.TossType;
export namespace IPaymentReservation {
  /**
   * 아임 포트의 간편 결제 카드 정보.
   */
  export type IamportType = BaseType<"iamport", IIamportSubscription>;

  /**
   * 토스의 간편 결제 수단 정보.
   */
  export type TossType = BaseType<"toss.payments", ITossBilling>;

  /**
   * 간편 결제 수단의 기본 정보.
   */
  export interface BaseType<
    VendorCode extends IPaymentVendor.Code,
    Data extends object,
  > {
    /**
     * Primary Key.
     */
    id: string & tags.Format<"uuid">;

    /**
     * 벤더사 코드.
     *
     * {@link IPaymentVendor.code}와 완전히 동일한 값이되, 단지 union type
     * specialization 을 위해 중복 표기하였을 뿐이다. If else condition 을 통하여
     * {@link IPaymentReservation.data}의 타입을 특정할 수 있다.
     */
    vendor_code: VendorCode;

    /**
     * 벤더사.
     */
    vendor: IPaymentVendor<VendorCode>;

    /**
     * 대상 액터의 참조 정보.
     */
    source: IPaymentSource;

    /**
     * 제목.
     */
    title: string;

    /**
     * 벤더사 데이터.
     */
    data: Data;

    /**
     * 레코드 생성 일시.
     */
    created_at: string & tags.Format<"date-time">;
  }

  /**
   * 간편 결제 수단 등록 정보.
   *
   * 결제사의 팝업 창로부터 전달받은 식별자 정보를 취합하여 전달한다.
   *
   * 참고로 아임포트의 경우 간편 결제로 등록한 카드에 자체 식별자 번호를 부여하지 않는다.
   * 따라서 귀하의 서비스가 발행한 식별자 ID 가 곧, 해당 간편 결제 수단의 유일무이한
   * 식별자ㅏ 되니, 이를 {@link IPaymentVendor.uid} 와 {@link IPaymentSource.id} 에
   * 모두 동일하게 할당해주면 된다.
   */
  export interface ICreate {
    /**
     * 벤더사 정보.
     */
    vendor: IPaymentVendor<IPaymentVendor.Code>;

    /**
     * 원천 레코드 정보.
     */
    source: IPaymentSource;

    /**
     * 제목
     */
    title: string;

    /**
     * 간편결제 비밀번호.
     *
     * 주의할 점은 카드 비밀번호가 아니라는 것.
     */
    password: string;
  }
}
