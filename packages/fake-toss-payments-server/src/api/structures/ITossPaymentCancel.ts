import { tags } from "typia";

/**
 * 결제 취소 정보.
 *
 * @author Samchon
 */
export interface ITossPaymentCancel {
  /**
   * 취소 총액.
   */
  cancelAmount: number;

  /**
   * 취소 사유.
   */
  cancelReason: string;

  /**
   * 면세 처리된 금액.
   */
  taxFreeAmount: number;

  /**
   * 과세 처리된 금액.
   */
  taxAmount: number;

  /**
   * 결제 취소 후 환불 가능 잔액.
   */
  refundableAmount: number;

  /**
   * 취소 일시.
   */
  canceledAt: string & tags.Format<"date-time">;
}
export namespace ITossPaymentCancel {
  /**
   * 결제 취소 신청 정보.
   */
  export interface ICreate {
    /**
     * {@link ITossPayment} 의 식별자 키.
     */
    paymentKey: string;

    /**
     * 취소 사유.
     */
    cancelReason: string;

    /**
     * 취소 총액.
     */
    cancelAmount?: number;

    /**
     * 환불 계좌 정보.
     *
     * 결제를 가상 계좌로 하였을 때에만 해당함.
     */
    refundReceiveAccount?: {
      /**
       * 은행 정보.
       */
      bank: string;

      /**
       * 계좌 번호.
       */
      accountNumber: string & tags.Pattern<"^[0-9]{0,20}$">;

      /**
       * 예금주.
       */
      holderName: string;
    };

    /**
     * 과세 처리 금액.
     */
    taxAmount?: number;

    /**
     * 면세 처리 금액.
     */
    taxFreeAmount?: number;

    /**
     * 결제 취소 후 환불 가능 잔액.
     */
    refundableAmount?: number;
  }
}
