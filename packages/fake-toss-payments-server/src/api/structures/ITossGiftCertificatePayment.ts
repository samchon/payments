import { ITossPayment } from "./ITossPayment";

/**
 * 상품권 결제 정보.
 *
 * @author Samchon
 */
export interface ITossGiftCertificatePayment
  extends ITossPayment.IBase<"상품권", "NORMAL"> {
  /**
   * 상품권 정보.
   */
  giftCertificate: ITossGiftCertificatePayment.IGiftCertificate;
}
export namespace ITossGiftCertificatePayment {
  /**
   * 상품권 정보.
   */
  export interface IGiftCertificate {
    /**
     * 승인 번호.
     */
    approveNo: string;

    /**
     * 정산 상태.
     */
    settlementStatus: "COMPLETE" | "INCOMPLETE";
  }
}
