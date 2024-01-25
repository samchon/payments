import { tags } from "typia";

import { IIamportPayment } from "./IIamportPayment";

/**
 * 간편 결제 카드 정보.
 *
 * @author Samchon
 */
export interface IIamportSubscription extends IIamportSubscription.IAccessor {
  pg_provider: string;
  pg_id: string;
  card_name: string;
  card_code: string;
  card_number: string;
  card_type: string;
  customer_name: null | string;
  customer_tel: null | string;
  customer_email: null | string;
  customer_addr: null | string;
  customer_postcode: null | string;
  inserted: number;
  updated: number;
}
export namespace IIamportSubscription {
  /**
   * {@link IIamportSubscription} 의 접근자 정보.
   */
  export interface IAccessor {
    /**
     * 고객 식별자 키.
     *
     * 아임포트가 아닌, 이를 이용하는 서비스에서 자체적으로 관리하는 식별자 키.
     *
     * 다만 고객이라기보다 실제로는 카드의 식별자 키로 써야함.
     */
    customer_uid: string;
  }

  /**
   * 간편 결제 카드 입력 정보.
   */
  export interface ICreate extends IAccessor {
    /**
     * 카드 번호.
     *
     * 형식: XXXX-XXXX-XXXX-XXXX
     */
    card_number: string & tags.Pattern<"\\d{4}-\\d{4}-\\d{4}-\\d{4}">;

    /**
     * 카드 유효기간.
     *
     * 형식: YYYY-MM
     */
    expiry: string & tags.Pattern<"^([0-9]{4})-(0[1-9]|1[012])$">;

    /**
     * 생년월일 YYMMDD 또는 사업자등록번호 10자리.
     */
    birth: string &
      tags.Pattern<"^(([0-9]{2})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01]))|(\\d{10})$">;

    /**
     * 카드 비밀번호 앞 두 자리.
     */
    pwd_2digit?: string & tags.Pattern<"\\d{2}">;

    /**
     * 카드 인증번호 (카드 뒷면 3 자리).
     */
    cvc?: string & tags.Pattern<"\\d{2}">;

    customer_name?: string;
    customer_tel?: string;
    customer_email?: string & tags.Format<"email">;
    customr_addr?: string;
    customer_postcode?: string;
  }

  /**
   * 결제 신청 입력 정보.
   */
  export interface IOnetime
    extends Omit<ICreate, "customer_uid">,
      Omit<IAgain, "customer_uid"> {
    /**
     * 고객 식별자 키.
     *
     * 아임포트가 아닌, 이를 이용하는 서비스에서 자체적으로 관리하는 식별자 키.
     *
     * 다만 고객이라기보다 실제로는 카드의 식별자 키로 써야함.
     *
     * 이를 생략시 단순 결제로만 그치며, 카드 정보가 간편 결제용으로 등록되지 아니함.
     */
    customer_uid?: string;
  }

  /**
   * 간편 결제 카드로 결제 신청 입력 정보.
   */
  export interface IAgain extends IAccessor {
    /**
     * 주문 식별자 키.
     *
     * 아임포트가 아닌 이를 이용하는 서비스에서 자체적으로 관리하는 식별자 키.
     */
    merchant_uid: string;

    /**
     * 결제 총액.
     */
    amount: number;

    /**
     * 주문 이름.
     */
    name: string;

    /**
     * 통화 정보.
     */
    currency?: IIamportPayment.Currency;

    /**
     * 면세 공급가액.
     *
     * 기본값은 0 로써, 알아서 amount 의 1/11 로써 부가세 처리됨.
     */
    tax_free?: number;

    /**
     * 할부 개월 수.
     *
     * 일시불은 0.
     */
    card_quota?: number;

    buyer_name?: string;
    buyer_email?: string & tags.Format<"email">;
    buyer_tel?: string;
    buyer_addr?: string;
    buyer_postcode?: string;

    /**
     * 카드할부처리할 때, 할부이자가 발생하는 경우 (카드사 무이자 프로모션 제외).
     *
     * 부과되는 할부이자를 고객대신 가맹점이 지불하고자 PG사와 계약된 경우(현재, 나이스페이먼츠만 지원됨)
     */
    interest_free_by_merchant?: boolean;

    /**
     * 승인요청시 카드사 포인트 차감하며 결제승인처리할지 flag.
     *
     * PG사 영업담당자와 계약 당시 사전 협의 필요(현재, 나이스페이먼츠만 지원됨)
     */
    use_card_point?: boolean;

    /**
     * 임의 정보를 기재할 수 있다.
     */
    custom_data?: string;

    /**
     * 결제 성공시 통지될 Notification, 웹훅 URL.
     */
    notice_url?: string & tags.Format<"uri">;
  }
}
