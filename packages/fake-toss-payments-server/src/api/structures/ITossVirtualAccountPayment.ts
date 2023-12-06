import { tags } from "typia";

import { ITossPayment } from "./ITossPayment";

/**
 * 가상 계좌 결제 정보.
 *
 * @author Samchon
 */
export interface ITossVirtualAccountPayment
  extends ITossPayment.IBase<"가상계좌", "NORMAL"> {
  /**
   * 가상 계좌로 결제할 때 전달되는 입금 콜백을 검증하기 위한 값.
   */
  secret: string;

  /**
   * 가상 계좌 정보.
   */
  virtualAccount: ITossVirtualAccountPayment.IVirtualAccount;
}
export namespace ITossVirtualAccountPayment {
  /**
   * 가상 계좌를 이용한 결제 신청 정보.
   */
  export interface ICreate {
    /**
     * 결제 수단이 가상 계좌임을 의미.
     */
    method: "virtual-account";

    /**
     * 주문 식별자 번호.
     *
     * 토스 페이먼츠가 아닌, 이를 이용하는 서비스에서 자체적으로 관리하는 식별자 키.
     */
    orderId: string;

    /**
     * 주문 이름.
     *
     * 토스 페이먼츠가 아닌, 이를 이용하는 서비스에서 발급한 주문명.
     */
    orderName: string;

    /**
     * 은행명.
     */
    bank: string;

    /**
     * 고객 이름.
     */
    customerName: string;

    /**
     * 결제 총액.
     */
    amount: number;

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

  /**
   * 가상 계좌 정보.
   */
  export interface IVirtualAccount {
    /**
     * 계좌 번호.
     */
    accountNumber: string;

    /**
     * 가상 계좌 타입.
     */
    accountType: "일반" | "고정";

    /**
     * 은행명.
     */
    bank: string;

    /**
     * 고객 이름.
     */
    customerName: string;

    /**
     * 입금 기한.
     */
    dueDate: string & tags.Format<"date">;

    /**
     * 가상 계좌 만료 여부.
     */
    expired: boolean;

    /**
     * 정산 상태.
     */
    settlementStatus: "INCOMPLETED" | "COMPLETED";

    /**
     * 환불 처리 상태.
     *
     *  - NONE: 해당 없음
     *  - FAILED: 환불 실패
     *  - PENDING: 환불 처리중
     *  - PARTIAL_FAILED: 부분 환불 실패
     *  - COMPLETED: 환불 완료
     */
    refundStatus:
      | "NONE"
      | "FAILED"
      | "PENDING"
      | "PARTIAL_FAILED"
      | "COMPLETED";
  }
}
