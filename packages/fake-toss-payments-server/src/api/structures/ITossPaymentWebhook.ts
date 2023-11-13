/**
 * 웹훅 이벤트 정보.
 *
 * @author Samchon
 */
export interface ITossPaymentWebhook {
  /**
   * 이벤트 타입.
   */
  eventType: "PAYMENT_STATUS_CHANGED";

  /**
   * 이벤트 데이터.
   */
  data: ITossPaymentWebhook.IData;
}
export namespace ITossPaymentWebhook {
  /**
   * 웹훅 이벤트 데이터.
   */
  export interface IData {
    /**
     * {@link ITossPayment} 의 식별자 키.
     */
    paymentKey: string;

    /**
     * 주문 식별자 키.
     *
     * 토스 페이먼츠가 아닌, 이를 이용하는 서비스에서 자체적으로 관리하는 식별자 키.
     */
    orderId: string;

    /**
     * 결제 상태.
     *
     *  - DONE: 결제 완료
     *  - CANCELED: 결제가 취소됨
     *  - PARTIAL_CANCELED: 결제가 부분 취소됨
     *  - WAITING_FOR_DEPOSIT: 입금 대기 중
     */
    status: "DONE" | "CANCELED" | "PARTIAL_CANCELED" | "WAITING_FOR_DEPOSIT";
  }
}
