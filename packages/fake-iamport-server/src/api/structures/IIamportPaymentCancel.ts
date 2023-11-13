import { tags } from "typia";

/**
 * 결제 취소 정보.
 *
 * @author Samchon
 */
export interface IIamportPaymentCancel {
  pg_id: string;
  pg_tid: string;
  amount: number;
  cancelled_at: number;
  reason: string;
  receipt_url: string & tags.Format<"url">;
}
export namespace IIamportPaymentCancel {
  /**
   * 결제 취소 입력 정보.
   */
  export interface IStore {
    /**
     * 결제 정보 {@link IIamportPayment} 의 식별자 키.
     */
    imp_uid: string;

    /**
     * 주문 식별자 키.
     *
     * 아임포트 서버가 아닌, 이를 사용하는 서비스가 자체적으로 발급하고 관리한다.
     */
    merchant_uid: string;

    /**
     * 취소 금액, 부분 취소도 가능하다.
     *
     * 누락시 전액 취소.
     */
    amount?: number;

    /**
     * 취소 트랜잭션 수행 전, 현재 시점의 취소 가능한 잔액.
     *
     * API요청자가 기록하고 있는 취소가능 잔액과 아임포트가 기록하고 있는 취소가능 잔액이
     * 일치하는지 사전에 검증하고, 검증에 실패하면 트랜잭션을 수행하지 않는다.
     *
     * `null` 인 경우에는 검증 프로세스를 생략.
     */
    checksum: null | (number & tags.Minimum<0>);

    /**
     * 취소 사유.
     */
    reason: string;

    /**
     * 취소요청금액 중 면세금액.
     *
     * @default 0
     */
    tax_free?: number;

    /**
     * 환불계좌 예금주.
     */
    refund_holder?: string;

    /**
     * 환불계좌 은행 코드.
     */
    refund_bank?: string;

    /**
     * 환불계좌 계좌번호.
     */
    refund_account?: string;

    /**
     * 환불계좌 예금주 연락처
     */
    refund_tel?: string;
  }
}
