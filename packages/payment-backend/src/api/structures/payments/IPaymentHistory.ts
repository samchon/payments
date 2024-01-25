import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { tags } from "typia";

import { IPaymentCancelHistory } from "./IPaymentCancelHistory";
import { IPaymentSource } from "./IPaymentSource";
import { IPaymentVendor } from "./IPaymentVendor";

/**
 * 결제 내역.
 *
 * `IPaymentHistory` 는 결제 내역을 형상화한 자료구조이자 유니언 타입의 인터페이이다.
 * 서비스 시스템으로부 결제 사건의 귀속 정보 ({@link IPaymentHistory.ICreate.vendor} +
 * {@link IPaymentHistory.ICreate.source}) 를 전달받아, 본 Payment 시스템이 PG 사에
 * 추가 정보를 취득하여 레코드가 완성된다.
 *
 * 그리고 만일 현 결제 건이 가상계좌와 같이 레코드 생성 시점에 지불이 이루어지지 않은
 * 경우라면, 사후 {@link IPaymentWebhook 웹훅 이벤트}를 통하여 지불 완료 시각을 뜻하는
 * {@link paid_at} 가 설정될 수 있다. 그리고 반대로 이미 결제가 완료된 경우라도,
 * 환불 등의 이유로 인하여 {@link cancelled_at} 이 사후 기재될 수 있다.
 *
 * 참고로 `if condition` 을 통하여 {@link IPaymentHistory.vendor_code} 값을 특정하면,
 * 파생 타입이 자동으로 다운 캐스팅 된다.
 *
 * ```typescript
 * if (history.vendor_code === "toss.payments")
 *     history.data.paymentKey; // history.data be ITossPayment
 * ```
 *
 * @author Samchon
 */
export type IPaymentHistory =
  | IPaymentHistory.IamportType
  | IPaymentHistory.TossType;
export namespace IPaymentHistory {
  /**
   * 아임포트로부터의 결제 내역.
   */
  export type IamportType = BaseType<"iamport", IIamportPayment>;

  /**
   * 토스 페이먼츠로부터의 결제 내역.
   */
  export type TossType = BaseType<"toss.payments", ITossPayment>;

  /**
   * 결제 내역의 기본 정보.
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
     * 벤더사 식별자 코드.
     *
     * {@link IPaymentVendor.code}와 완전히 동일한 값이되, 단지 union type
     * specialization 을 위해 중복 표기하였을 뿐이다. `if condition` 을 통하여
     * {@link IPaymentHistory.data}의 타입을 특정할 수 있다.
     */
    vendor_code: VendorCode;

    /**
     * 벤더 정보.
     */
    vendor: IPaymentVendor<VendorCode>;

    /**
     * 원천 래코드 정보.
     */
    source: IPaymentSource;

    /**
     * 결제 상세 데이터, 벤더별로 데이터 양식이 다르니 주의할 것.
     */
    data: Data;

    /**
     * 통화 단위
     *
     * KRW, USB, JPY 등.
     */
    currency: string;

    /**
     * 결제 가격.
     */
    price: number & tags.Minimum<0>;

    /**
     * 결제 취소시의 환불 금액.
     */
    refund: null | (number & tags.Minimum<0>);

    /**
     * 결제 정보가 갱신되었을 때, 이를 수신할 URL
     */
    webhook_url: null | (string & tags.Format<"uri">);

    /**
     * 결제 레코드 생성 일시.
     */
    created_at: string & tags.Format<"date-time">;

    /**
     * 결제 완료 일시.
     */
    paid_at: null | (string & tags.Format<"date-time">);

    /**
     * 결제 취소 일시.
     */
    cancelled_at: null | (string & tags.Format<"date-time">);

    /**
     * 결제 취소 내역 리스트.
     */
    cancels: IPaymentCancelHistory[];
  }

  /**
   * 결제 입력 정보.
   *
   * SDK 에서 받은 데이터를 취합하여 결제 진행 상황을 서버에 알려준다.
   */
  export interface ICreate {
    /**
     * 벤더사 정보
     */
    vendor: IPaymentVendor<"iamport" | "toss.payments">;

    /**
     * 결제의 근간이 된 원천 레코드 정보.
     */
    source: IPaymentSource;

    /**
     * 결제되어야 할 총액.
     *
     * 실 결제금액과 비교하여 이와 다를 시, 422 에러가 리턴됨.
     */
    price: number & tags.Minimum<0>;

    /**
     * 레코드 열람에 사용할 비밀번호 설정.
     */
    password: string;

    /**
     * 결제 정보가 갱신되었을 때, 이를 수신할 URL
     */
    webhook_url: string & tags.Format<"uri">;
  }

  /**
   * @internal
   */
  export interface IProps {
    currency: string;
    price: number;
    refund: null | number;
    paid_at: null | Date;
    cancelled_at: null | Date;
    cancels: IPaymentCancelHistory.IProps[];
    data: object;
  }
}
