import { IIamportPayment } from "./IIamportPayment";

/**
 * 가상 계좌 결제 정보.
 *
 * @author Samchon
 */
export interface IIamportVBankPayment extends IIamportPayment.IBase<"vbank"> {
  /**
   * 가상 계좌 식별자 코드.
   */
  vbank_code: string;

  /**
   * 가상 게좌 이름
   */
  vbank_name: string;

  /**
   * 가상 계좌 번호
   */
  vbank_num: string;

  /**
   * 가상 계좌 예금주.
   */
  vbank_holder: string;

  /**
   * 가상 계좌 입금 만료 기한.
   */
  vbank_date: number;

  /**
   * 가상 계좌 개설 일시.
   */
  vbank_issued_at: number;
}
export namespace IIamportVBankPayment {
  /**
   * 가상 계좌 결제 입력 정보.
   *
   * 가상 계좌를 임의 생성할 수 있다.
   *
   * 단, 일부 PG 사 혹은 `fake-iamport-server` 만 가능.
   *
   *   - 세틀뱅크
   *   - 나이스페이먼츠
   *   - KG이니시스
   */
  export interface IStore {
    /**
     * 주문 식별자 키.
     *
     * 아임포트 서버가 아닌, 이를 사용하는 서비스가 자체적으로 발급하고 관리한다.
     */
    merchant_uid: string;

    /**
     * 총액.
     */
    amount: number;

    /**
     * 가상계좌 은행 코드.
     */
    vbank_code: string;

    /**
     * 가상계좌 입금기한, 유닉스 타임.
     */
    vbank_due: number;

    /**
     * 예금주.
     */
    vbank_holder: string;

    name?: string;
    buyer_name?: string;
    buyer_email?: string;
    buyer_tel?: string;
    buyer_addr?: string;
    buyer_postcode?: string;
    pg?: string;

    /**
     * 가상 계좌 입금 정보를 수신할 URL.
     *
     * 누락시 기본 웹훅 URL 사용.
     */
    notice_url?: string;

    /**
     * 커스텀 데이터, 자유롭게 사용 가능.
     */
    custom_data?: string;

    /**
     * [이니시스 전용] 가맹점 콘솔에서 확인한 API 값.
     */
    pg_api_key?: string;
  }

  /**
   * 가상 계좌 결제의 수정 입력 정보.
   *
   * 아직 입금되지 않은 가상계좌의 입금기한 또는 입금금액을 수정할 수 있다.
   *
   * 다만, 세틀뱅크 혹은 `fake-iamport-server` 만 가능.
   */
  export interface IUpdate {
    /**
     * 대상 결제 기록의 {@link IIamportPayment.imp_uid}.
     */
    imp_uid: string;

    /**
     * 수정할 결제 금액.
     */
    amount?: number;

    /**
     * 수정할 가상계좌 입금 기한.
     */
    vbank_due?: number;
  }
}
