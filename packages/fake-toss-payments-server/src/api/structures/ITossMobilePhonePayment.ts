import { ITossPayment } from "./ITossPayment";

/**
 * 휴대폰 결제 정보.
 *
 * @author Samchon
 */
export interface ITossMobilePhonePayment
  extends ITossPayment.IBase<"휴대폰", "NORMAL"> {
  /**
   * 휴대폰 정보.
   */
  mobilePhone: ITossMobilePhonePayment.IMobilePhone;
}
export namespace ITossMobilePhonePayment {
  /**
   * 휴대폰 정보.
   */
  export interface IMobilePhone {
    /**
     * 통신사.
     */
    carrier: string;

    /**
     * 고객 휴대폰 번호.
     */
    customerMobilePhone: string;

    /**
     * 정산 상태.
     */
    settlementStatus: "INCOMPLETED" | "COMPLETED";
  }
}
