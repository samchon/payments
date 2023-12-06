import { tags } from "typia";

import { ITossBilling } from "./ITossBilling";
import { ITossCardPayment } from "./ITossCardPayment";
import { ITossCashReceipt } from "./ITossCashReceipt";
import { ITossGiftCertificatePayment } from "./ITossGiftCertificatePayment";
import { ITossMobilePhonePayment } from "./ITossMobilePhonePayment";
import { ITossPaymentCancel } from "./ITossPaymentCancel";
import { ITossTransferPayment } from "./ITossTransferPayment";
import { ITossVirtualAccountPayment } from "./ITossVirtualAccountPayment";

/**
 * 결제 정보.
 *
 * `ITossPayment` 는 토스 페이먼츠의 결제 정보를 형상화한 자료구조이자 유니언 타입의
 * 인터페이스로써, if condition 을 통하여 method 값을 특정하면, 파생 타입이 자동으로
 * 지정된다.
 *
 * ```typescript
 * if (payment.method === "카드")
 *     payment.card; // payment be ITossCardPayment
 * ```
 *
 * @author Samchon
 */
export type ITossPayment =
  | ITossCardPayment
  | ITossGiftCertificatePayment
  | ITossMobilePhonePayment
  | ITossTransferPayment
  | ITossVirtualAccountPayment;

export namespace ITossPayment {
  /* ----------------------------------------------------------------
        RESPONSE
    ---------------------------------------------------------------- */
  /**
   * 결제의 기본 정보.
   */
  export interface IBase<
    Method extends string,
    Type extends string,
    Status extends string =
      | "READY"
      | "IN_PROGRESS"
      | "WAITING_FOR_DEPOSIT"
      | "DONE"
      | "CANCELED"
      | "PARTIAL_CANCELED"
      | "ABORTED"
      | "EXPIRED",
  > {
    /**
     * 결제 수단.
     */
    method: Method;

    /**
     * 결제 타입.
     *
     *   - NORMAL: 일반 결제
     *   - BILLING: 미리 등록한 카드에 의한 간편 결제.
     */
    type: Type;

    /**
     * 결제 상태.
     *
     *   - READY
     *   - IN_PROGRESS
     *   - WAITING_FOR_DEPOSIT
     *   - DONE
     *   - CANCELED
     *   - PARTIAL_CANCELED
     *   - ABORTED
     *   - EXPIRED
     */
    status: Status;

    /**
     * 가맹점 ID.
     *
     * 현재 tosspayments 가 쓰임.
     */
    mId: string;

    /**
     * 사용 중인 토스 페이먼츠 API 의 버전.
     */
    version: string;

    /**
     * 결제 내역의 식별자 번호.
     */
    paymentKey: string;

    /**
     * 주문 식별자 키.
     *
     * 토스 페이먼츠가 아닌, 이를 이용하는 서비스에서 자체적으로 관리하는 식별자 키.
     */
    orderId: string;

    /**
     * 거래 건에 대한 고유한 키 값.
     *
     * {@link paymentKey} 와 달리, 이를 사용할 일은 없더라.
     */
    transactionKey: string;

    /**
     * 주문 이름.
     *
     * 토스 페이먼츠가 아닌, 이를 이용하는 서비스에서 발급한 주문명.
     */
    orderName: string;

    /**
     * 화폐 단위.
     *
     * 현재 토스 페이먼츠는 KRW 만 사용 가능.
     */
    currency: string;

    /**
     * 총 결제 금액.
     */
    totalAmount: number;

    /**
     * 취소할 수 있는 금액.
     */
    balanceAmount: number;

    /**
     * 공급가액.
     */
    suppliedAmount: number;

    /**
     * 면세액.
     */
    taxFreeAmount: number;

    /**
     * 부가세.
     */
    vat: number;

    /**
     * 에스크로 사용 여부.
     */
    useEscrow: boolean;

    /**
     * 문화비 지출 여부.
     *
     * 도석입, 공연 티켓, 박물관/미술관 입장권 등.
     */
    cultureExpense: boolean;

    /**
     * 결제 요청 일시.
     */
    requestedAt: string & tags.Format<"date-time">;

    /**
     * 결제 승인 일시.
     */
    approvedAt: null | (string & tags.Format<"date-time">);

    /**
     * 결제 취소 내역.
     */
    cancels: null | ITossPaymentCancel[];

    /**
     * 현금 영수증 정보.
     */
    cashReceipt: null | ITossCashReceipt.ISummary;
  }

  /* ----------------------------------------------------------------
        REQUEST
    ---------------------------------------------------------------- */
  /**
   * 결제 승인 정보.
   */
  export interface IApproval {
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
   * 결제 신청 정보.
   *
   * `ITossPayment.ICreate` 는 결제 신청 정보를 형상화한 자료구조이자 유니언 타입의
   * 인터페이스로써, if condition 을 이용하여 대상 method 를 특정하면, 파생 타입이
   * 자동으로 지정된다.
   *
   * ```typescript
   * if (input.method === "card")
   *     input.cardNumber; // input is ITossCardPayment.ICreate
   * ```
   */
  export type ICreate =
    | ITossCardPayment.ICreate
    | ITossBilling.IPaymentStore
    | ITossVirtualAccountPayment.ICreate;

  // export interface IFinalize
  // {
  //     paymentKey: string;
  //     orderId: string;
  //     amount: number;
  // }
}
