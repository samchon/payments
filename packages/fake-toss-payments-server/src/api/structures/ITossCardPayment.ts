import { tags } from "typia";

import { ITossPayment } from "./ITossPayment";

/**
 * 카드 결제 정보.
 *
 * @author Samchon
 */
export interface ITossCardPayment
  extends ITossPayment.IBase<"카드", "NORMAL" | "BILLING"> {
  /**
   * 카드 정보.
   */
  card: ITossCardPayment.ICard;

  /**
   * 카드사의 즉시 할인 프로모션 정보.
   */
  discount: null | ITossCardPayment.IDiscount;

  /**
   * 간편결제로 결제한 경우 간편결제 타입 정보.
   */
  easyPay: null | "토스결제" | "페이코" | "삼성페이";
}
export namespace ITossCardPayment {
  /**
   * 카드 정보.
   */
  export interface ICard {
    /**
     * 카드사 이름.
     */
    company: string;

    /**
     * 카드 번호.
     */
    number: string & tags.Pattern<"[0-9]{16}">;

    /**
     * 할부 개월 수.
     */
    installmentPlanMonths: number;

    /**
     * 무이자 할부 적용 여부.
     */
    isInterestFree: boolean;

    /**
     * 승인 번호.
     */
    approveNo: string;

    /**
     * 카드 포인트 사용 여부.
     */
    useCardPoint: false;

    /**
     * 카드 타입.
     */
    cardType: "신용" | "체크" | "기프트";

    /**
     * 카드의 소유자 타입.
     */
    ownerType: "개인" | "법인";

    /**
     * 카드 결제의 매입 상태.
     *
     *  - READY: 매입 대기
     *  - REQUESTED: 매입 요청됨
     *  - COMPLETED: 매입 완료
     *  - CANCEL_REQUESTED: 매입 취소 요청됨
     *  - CANCELD: 매입 취소됨
     */
    acquireStatus:
      | "READY"
      | "REQUESTED"
      | "COMPLETED"
      | "CANCEL_REQUESTED"
      | "CANCELED";

    /**
     * 영수증 URL.
     */
    receiptUrl: string & tags.Format<"uri">;
  }

  /**
   * 카드사의 즉시 할인 프로모션 정보.
   */
  export interface IDiscount {
    /**
     * 카드사의 즉시 할인 프로모션을 적용한 금액.
     */
    amount: number;
  }

  /**
   * 신용 카드를 이용한 결제 신청 정보.
   */
  export interface ICreate {
    /**
     * 결제 수단이 신용 카드임을 의미.
     */
    method: "card";

    /**
     * 카드 번호.
     */
    cardNumber: string & tags.Pattern<"[0-9]{16}">;

    /**
     * 카드 만료 년도 (2 자리).
     */
    cardExpirationYear: string & tags.Pattern<"\\d{2}">;

    /**
     * 카드 만료 월 (2 자리).
     */
    cardExpirationMonth: string & tags.Pattern<"^(0[1-9]|1[012])$">;

    /**
     * 카드 비밀번호.
     */
    cardPassword?: string;

    /**
     * 할부 개월 수.
     */
    cardInstallmentPlan?: number;

    /**
     * 지불 총액.
     */
    amount: number;

    /**
     * 면세금 총액.
     */
    taxFreeAmount?: number;

    /**
     * 주문 식별자 키.
     *
     * 토스 페이먼츠가 아닌, 이를 이용하는 서비스에서 자체적으로 관리하는 식별자 키.
     */
    orderId: string;

    /**
     * 주문 이름.
     *
     * 토스 페이먼츠가 아닌, 이를 이용하는 서비스에서 발급한 주문명.
     */
    orderName?: string;

    /**
     * 고객의 생년월일.
     *
     * 표기 형식 YYMMDD.
     */
    customerBirthday?: string &
      tags.Pattern<"^([0-9]{2})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$">;

    /**
     * 고객의 이메일.
     */
    customerEmail?: string & tags.Format<"email">;

    /**
     * 해외카드로 결제하는 경우 3DS 인증 적용을 위해 사용.
     *
     * 3DS 인증 결과를 전송해야 하는 경우에만 필수.
     */
    vbv?: {
      /**
       * 3D Secure 인증 세션에 대한 인증 값.
       */
      cavv: string;

      /**
       * 트랜잭션 ID.
       */
      xid: string;

      /**
       * 3DS 인증 결과에 대한 코드 값.
       */
      eci: string;
    };

    /**
     * 결제 승인 여부.
     *
     * 오직 가짜 페이먼츠 서버 `fake-toss-payments-server` 에서만 사용되는 값으로써,
     * 결제 승인을 고의로 지연시키거나 할 때 사용된다. 이 값을 `false` 로 하면, 프론트
     * 어플리케이션이 토스 페이먼츠가 제공해주는 결제 창을 사용하여 결제를 진행하는
     * 상황을 시뮬레이션할 수 있다.
     *
     * 본디 토스 페이먼츠 서버는 프론트 어플리케이션에서 백엔드 서버를 거치지 않고,
     * 토스 페이먼츠가 제공해주는 결제 창을 이용하여 직접 결제를 요청하는 경우,
     * 백엔드에서 이를 별도 {@link functional.payments.approve 승인} 처리해주기 전까지
     * 정식 결제로 인청치 아니한다.
     *
     * 반면 백엔드 서버에서 토스 페이먼츠 서버의 API 를 호출하는 경우, 토스 페이먼츠는
     * 이를 그 즉시로 승인해주기, `fake-toss-payments-server` 에서 별도의 승인 처리가
     * 필요한 상황을 시뮬레이션하기 위해서는 이러한 속성이 필요한 것.
     */
    __approved?: boolean;
  }
}
