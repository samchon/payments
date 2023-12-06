import { tags } from "typia";

/**
 * 현금 영수증 정보.
 *
 * @author Samchon
 */
export interface ITossCashReceipt {
  /**
   * 현금 영수증의 식별자 키.
   */
  receiptKey: string;

  /**
   * 현금 영수증의 종류.
   */
  type: ITossCashReceipt.Type;

  /**
   * 주문의 식별자 ID.
   */
  orderId: string;

  /**
   * 주문 이름.
   */
  orderName: string;

  /**
   * 현금 영수증 승인 번호.
   */
  approvalNumber: string;

  /**
   * 현금 영수증 승인 일시.
   */
  approvedAt: string & tags.Format<"date-time">;

  /**
   * 현금 영수증 취소 일시.
   */
  canceledAt: null | (string & tags.Format<"date-time">);

  /**
   * 영수증 URL.
   */
  receiptUrl: string;

  /**
   * @internal
   */
  __paymentKey: string;
}
export namespace ITossCashReceipt {
  /**
   * 현금 영수증의 종류.
   */
  export type Type = "소득공제" | "지출증빙";

  /**
   * 현금 영수증 요약 정보.
   */
  export interface ISummary {
    /**
     * 현금 영수증의 종류.
     */
    type: Type;

    /**
     * 현금 영수증 처리된 금액.
     */
    amount: number;

    /**
     * 면세 처리된 금액.
     */
    taxFreeAmount: number;

    /**
     * 현금영수증 발급번호.
     */
    issueNumber: string;

    /**
     * 현금영수증 조회 페이지 주소.
     */
    receiptUrl: string;
  }

  /**
   * 현금 영수증 입력 정보.
   */
  export interface ICreate {
    /**
     * 현금 영수증의 종류.
     */
    type: Type;

    /**
     * 귀속 결제의 {@link ITossPayment.paymentKey}.
     */
    paymentKey: string;

    /**
     * 주문의 식별자 ID.
     */
    orderId: string;

    /**
     * 주문 이름.
     */
    orderName: string;

    /**
     * 현금 영수증 발급을 위한 개인 식별 번호.
     *
     * 현금 영수증의 종류에 따라 휴대폰 번호나 주민등록번호 또는 사업자등록번호 및
     * 카드 번호를 입력할 수 있다.
     */
    registrationNumber: string;

    /**
     * 현금 영수증을 발행할 금액.
     */
    amount: number;

    /**
     * 면세 금액.
     */
    taxFreeAmount?: number;

    /**
     * 사업자 등록번호.
     */
    businessNumber?: string;
  }

  /**
   * 현금 영수증 취소 입력 정보.
   */
  export interface ICancel {
    /**
     * 취소 금액.
     *
     * 미 입력시 현금 영수증에 기재된 {@link ITossCashReceipt.amount 총액}이 취소됨.
     */
    amount?: number;
  }
}
