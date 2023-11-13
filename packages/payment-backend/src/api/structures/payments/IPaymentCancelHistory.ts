import { tags } from "typia";

import { IPaymentSource } from "./IPaymentSource";

/**
 * 결제 취소 내역.
 *
 * @author Samchon
 */
export interface IPaymentCancelHistory {
  /**
   * 결제 취소 사유.
   */
  reason: string;

  /**
   * 환불 금액.
   */
  price: number & tags.Minimum<0>;

  /**
   * 레코드 생성 일시.
   *
   * 즉, 결제 취소가 발생한 시각.
   */
  created_at: string & tags.Format<"date-time">;
}
export namespace IPaymentCancelHistory {
  /**
   * 결제 취소 입력 정보.
   */
  export interface IStore {
    /**
     * 결제의 근간이 된 원천 레코드 정보.
     */
    source: IPaymentSource;

    /**
     * 결제 이력에 대한 비밀번호 입력.
     */
    password: string;

    /**
     * 환불 금액.
     */
    price: number & tags.Minimum<0>;

    /**
     * 결제 취소 사유.
     */
    reason: string;

    /**
     * 환불 계좌 정보.
     *
     * 가상 계좌로 입금한 경우, 결제 취소시, 이를 환불받을 계좌가 필요함.
     *
     * 단, 이 정보는 본 결제 시스템에 저장하지 아니함.
     */
    account: null | IBankAccount;
  }

  /**
   * 은행 계좌 정보.
   *
   * 가상 계좌로 입금한 경우, 결제 취소시, 이를 환불받을 계좌가 필요함.
   *
   * 단, 이 정보는 본 결제 시스템에 저장하지 아니함.
   */
  export interface IBankAccount {
    /**
     * 은행 이름.
     */
    bank: string;

    /**
     * 계좌번호.
     */
    account: string;

    /**
     * 예금주.
     */
    holder: string;

    /**
     * 연락처, 핸드폰 번호.
     */
    mobile: string;
  }

  /**
   * @internal
   */
  export interface IProps {
    data: object;
    created_at: Date;
    price: number;
    reason: string;
  }
}
