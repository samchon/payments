import { tags } from "typia";

/**
 * 현금 영수증 정보.
 *
 * @author Samchon
 */
export interface IIamportReceipt {
  /**
   * 귀속 결제의 {@link IIamportPayment.imp_uid}.
   */
  imp_uid: string;

  /**
   * 현금 영수증의 고유 식별자 ID.
   */
  receipt_uid: string;

  /**
   * 승인 번호.
   */
  apply_num: string;

  /**
   * 발행 타입 (대상).
   */
  type: IIamportReceipt.Type;

  /**
   * 결제 총액.
   */
  amount: number;

  /**
   * 부가세.
   */
  vat: number;

  /**
   * 현금영수증 조회 URL.
   */
  receipt_url: string & tags.Format<"url">;

  /**
   * 현금영수증 발행 시간.
   */
  applied_at: number;

  /**
   * 현금영수증 취소 시간.
   *
   * 리눅스 타임이 쓰이며, `null` 대신 0 을 씀.
   */
  cancelled_at: number;
}

export namespace IIamportReceipt {
  /**
   * 현금영수증 발행대상 유형.
   *
   *  - person: 주민등록번호
   *  - business: 사업자등록번호
   *  - phone: 휴대폰번호
   *  - taxcard: 국세청현금영수증카드
   */
  export type IdentifierType = "person" | "business" | "phone" | "taxcard";

  /**
   * 현금영수증 발행 타입 (대상).
   */
  export type Type = "person" | "company";

  /**
   * 현금영수증 입력 정보.
   */
  export interface ICreate {
    /**
     * 귀속 결제의 {@link IIamportPayment.imp_uid}.
     */
    imp_uid: string;

    /**
     * 현금영수증 발생대상 식별정보.
     *
     *   - 국세청현금영수증카드
     *   - 휴대폰번호
     *   - 주민등록번호
     *   - 사업자등록번호
     */
    identifier: string;

    /**
     * 현금영수증 발행대상 유형.
     *
     *  - person: 주민등록번호
     *  - business: 사업자등록번호
     *  - phone: 휴대폰번호
     *  - taxcard: 국세청현금영수증카드
     *
     * 일부 PG 사의 경우 이 항목이 없어 된다는데, 어지간하면 그냥 쓰기 바람.
     */
    identifier_type?: IdentifierType;

    /**
     * 현금영수증 발행 타입 (대상).
     *
     * 누락시 person 이 사용됨.
     */
    type?: Type;

    /**
     * 구매자 이름.
     *
     * 형금영수증 발행건 사후 추적을 위해 가급 입력하기 바람.
     */
    buyer_name?: string;

    /**
     * 구매자 이메일.
     */
    buyer_email?: string;

    /**
     * 구매자 전화번호.
     *
     * 현금영수증 발행건 사후 추적을 위해 가급 입력하기 바람.
     */
    buyer_tel?: string;

    /**
     * 면세 금액.
     */
    tax_free?: number;
  }
}
