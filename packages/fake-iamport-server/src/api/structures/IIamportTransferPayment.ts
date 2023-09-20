import { IIamportPayment } from "./IIamportPayment";

/**
 * 계좌 이체 결제 정보.
 *
 * @author Samchon
 */
export interface IIamportTransferPayment
    extends IIamportPayment.IBase<"trans"> {
    /**
     * 은행 식별자 코드.
     */
    bank_code: string;

    /**
     * 은행 이름.
     */
    bank_name: string;
}
