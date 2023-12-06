import { tags } from "typia";

/**
 * 간편 결제 등록 수단 정보.
 *
 * `ITossBilling` 은 간편 결제 등록 수단을 형상화한 자료구조 인터페이스로써, 고객이 자신의
 * 신용 카드를 서버에 등록해두고, 매번 결제가 필요할 때마다 카드 정보를 반복 입려하는 일
 * 없이 간편하게 결제를 진행하고자 할 때 사용한다.
 *
 * @author Samchon
 */
export interface ITossBilling extends ITossBilling.ICustomerKey {
  /**
   * 가맹점 ID.
   *
   * 현재 tosspayments 가 쓰임.
   */
  mId: string;

  /**
   * {@link ITossBilling} 의 식별자 키.
   */
  billingKey: string;

  /**
   * 결제 수단.
   */
  method: "카드";

  /**
   * 카드사 이름.
   */
  cardCompany: string;

  /**
   * 카드 번호.
   */
  cardNumber: string & tags.Pattern<"[0-9]{16}">;

  /**
   * 인증 일시.
   */
  authenticatedAt: string & tags.Format<"date-time">;
}
export namespace ITossBilling {
  /**
   * 간편 결제 카드 등록 정보.
   */
  export interface ICreate extends ICustomerKey {
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
    cardPassword: string;

    /**
     * 고객의 생년월일.
     *
     * 표기 형식 YYMMDD.
     */
    customerBirthday: string &
      tags.Pattern<"^([0-9]{2})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$">;

    /**
     * 고객의 이름.
     */
    consumerName?: string;

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
  }

  /**
   * 간편 결제를 이용한 결제 신청 정보.
   */
  export interface IPaymentStore extends ICustomerKey {
    /**
     * 결제 수단이 간편 결제임을 의미함.
     */
    method: "billing";

    /**
     * {@link IPaymentStore} 의 식별자 키.
     */
    billingKey: string;

    /**
     * 주문 식별자 키.
     *
     * 토스 페이먼츠가 아닌, 이를 이용하는 서비스에서 자체적으로 관리하는 식별자 키.
     */
    orderId: string;

    /**
     * 결제 총액.
     */
    amount: number;
  }

  /**
   * {@link ITossBilling} 의 식별자 정보.
   *
   * `ITossBilling.IAccessor` 는 프론트 어플리케이션이 토스 페이먼츠에서 제공해주는
   * 간편 결제 카드 등록 창을 이용했을 때, 해당 창에서 모든 과정이 완료된 후 보내주는
   * 정보를 형상화한 자료구조 인터페이스이다.
   *
   * 프론트 어플리케이션이 이 식별자 정보를 백엔드 서버로 보내면, 백엔드 서버는 토스
   * 페이먼츠 서버의 {@link functional.billing.at} 함수를 호출함으로써, 해당 간편 결제
   * 수단 정보를 취득할 수 있다.
   */
  export interface IAccessor extends ICustomerKey {
    /**
     * 토스 페이먼츠에서 redirect URL 로 보내준 값.
     *
     * 실상 Billing 의 식별자 {@link ITossBilling.billingKey} 그 자체라고 보면 됨.
     */
    authKey: string;
  }

  /**
   * 고객 식별자 정보.
   */
  export interface ICustomerKey {
    /**
     * 고객 식별자 키.
     *
     * 토스 페이먼츠가 아닌, 이를 이용하는 서비스에서 자체적으로 관리하는 식별자 키.
     */
    customerKey: string;
  }
}
