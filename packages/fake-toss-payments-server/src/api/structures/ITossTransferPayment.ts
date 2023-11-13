import { ITossPayment } from "./ITossPayment";

/**
 * 계좌 이체 결제 정보.
 *
 * @author Samchon
 */
export interface ITossTransferPayment
  extends ITossPayment.IBase<"계좌이체", "NORMAL"> {
  /**
   * 계좌 이체 정보.
   */
  transfer: ITossTransferPayment.ITransfer;
}
export namespace ITossTransferPayment {
  /**
   * 계좌 이체 정보.
   */
  export interface ITransfer {
    /**
     * 은행명.
     */
    bank: string;

    /**
     * 이체 상태.
     */
    settlementStatus: "INCOMPLETED" | "COMPLETED";
  }
}
