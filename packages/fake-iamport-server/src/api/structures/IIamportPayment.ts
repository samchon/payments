import { tags } from "typia";

import { IIamportCardPayment } from "./IIamportCardPayment";
import { IIamportPaymentCancel } from "./IIamportPaymentCancel";
import { IIamportTransferPayment } from "./IIamportTransferPayment";
import { IIamportVBankPayment } from "./IIamportVBankPayment";

/**
 * 결제 정보.
 *
 * `IIamportPayment` 는 아임포트의 결제 정보를 형상화한 자료구조이자 유니언 타입의
 * 인터페이스로써, if condition 을 통하여 method 값을 특정하면, 파생 타입이 자동으로
 * 지정된다.
 *
 * ```typescript
 * if (payment.pay_method === "card")
 *    payment.card_number; // payment be IIamportCardPayment
 * ```
 *
 * @author Samchon
 */
export type IIamportPayment =
  | IIamportCardPayment
  | IIamportTransferPayment
  | IIamportVBankPayment
  | IIamportPayment.IBase<
      Exclude<IIamportPayment.PayMethod, "card" | "samsung" | "trans" | "vbank">
    >;

export namespace IIamportPayment {
  /**
   * 결제 수단이 페이팔인 경우, 페이팔의 구매자 보호정책에 의해 결제 승인 시점에
   * Pending 상태를 만든 후, 내부 심사등을 통해 최종 결제 완료라고 변경함.
   *
   * `iamport` 의 기술적 이슈로 해당 상태를 status: failed 로 기록함. 추후
   * 페이팔에서 최종결제완료로 변경된 경우, `iamport` 에서 `paid` 로 변경 후,
   * 해당건에 대한 웹훅 발송. `iamport` 를 사용하는 고객사에서는, failed 로 이미
   * 처리된 결제건에 대한 paid 상태의 웹훅을 받는 문제점이 생김.
   *
   * 이에, `iamport` 에서 제공하는 `/payment/{imp_uid}` 에 query-string 으로
   * `extension=true` 옵션을 추가해야 함
   *
   * @issue https://github.com/samchon/fake-iamport-server/issues/13
   * @author Sangjin Han - https://github.com/ltnscp9028
   */
  export interface IQuery {
    /**
     * 페이팔의 경우, 이 값을 `true` 로 할 것.
     */
    extension?: boolean;
  }

  /**
   * 웹훅 데이터.
   */
  export interface IWebhook {
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
     * 현재 상태.
     */
    status: Status;
  }

  /**
   * 결제 기본 (공통) 정보.
   */
  export interface IBase<Method extends PayMethod> {
    // IDENTIFIER
    pay_method: Method;

    /**
     * 결제 정보 {@link IIamportPayment} 의 식별자 키.
     */
    imp_uid: string;

    // ORDER INFO
    /**
     * 주문 식별자 키.
     *
     * 아임포트 서버가 아닌, 이를 사용하는 서비스가 자체적으로 발급하고 관리한다.
     */
    merchant_uid: string;

    /**
     * 주문명, 누락 가능.
     */
    name: null | string;

    /**
     * 결제 총액.
     */
    amount: number;

    /**
     * 결제 취소, 환불 총액.
     */
    cancel_amount: number;

    /**
     * 통화 단위.
     */
    currency: IIamportPayment.Currency;

    /**
     * 영수증 URL.
     */
    receipt_url: string & tags.Format<"uri">;

    /**
     * 현금 영수증 발행 여부.
     */
    cash_receipt_issue: boolean;

    // PAYMENT PRVIDER INFO
    channel: string;
    pg_provider: string;
    emb_pg_provider: null | string;
    pg_id: string;
    pg_tid: string;
    escrow: boolean;

    // BUYER
    buyer_name: null | string;
    buyer_email: null | (string & tags.Format<"email">);
    buyer_tel: null | string;
    buyer_addr: null | string;
    buyer_postcode: null | string;
    customer_uid: null | string;
    customer_uid_usage: null | string;
    custom_data: null | string;
    user_agent: null | string;

    // PROPERTIES
    /**
     * 결제의 현재 (진행) 상태.
     */
    status: IIamportPayment.Status;

    /**
     * 결제 신청 일시.
     *
     * 리눅스 타임이 쓰임.
     */
    started_at: number;

    /**
     * 결제 (지불) 완료 일시.
     *
     * 리눅스 타임이 쓰이며, `null` 대신 0 을 씀.
     */
    paid_at: number;

    /**
     * 결제 실패 일시.
     *
     * 리눅스 타임이 쓰이며, `null` 대신 0 을 씀.
     */
    failed_at: number;

    /**
     * 결제 취소 일시.
     *
     * 리눅스 타임이 쓰이며, `null` 대신 0 을 씀.
     */
    cancelled_at: number;

    // CANCELLATIONS
    fail_reason: null | string;
    cancel_reason: null | string;
    cancel_history: IIamportPaymentCancel[];

    /**
     * @internal
     */
    notice_url?: string & tags.Format<"uri">;
  }

  export type PayMethod =
    | "card"
    | "trans"
    | "vbank"
    | "phone"
    | "samsung"
    | "kpay"
    | "kakaopay"
    | "payco"
    | "lpay"
    | "ssgpay"
    | "tosspay"
    | "cultureland"
    | "smartculture"
    | "happymoney"
    | "booknlife"
    | "point";
  export type Status = "paid" | "ready" | "failed" | "cancelled";
  export type Currency = "KRW" | "USD" | "EUR" | "JPY";
}
