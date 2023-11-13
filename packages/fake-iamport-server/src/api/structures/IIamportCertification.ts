import { tags } from "typia";

/**
 * 본인 인증 내역.
 *
 * `IIamportCertification` 은 아임포트의 본인인증 정보를 형상화한 자료구조 인터페이스이다.
 *
 * 단, `IIamportCertification` 레코드의 존재가 곧 본인인증의 완결을 뜻하는 것은 아니다.
 * {@link IIamportCertification.certified} 값이 `true` 여야만이 비로소, 본인인증
 * 대상자가 자신의 핸드폰 번호로 전송된 OTP 를 아임포트의 본인인증 팝업창에 정확히 적어,
 * 본인인증을 완료했음을 의미한다.
 *
 * @author Samchon
 */
export interface IIamportCertification {
  /**
   * 아임포트가 발급해 준 식별자 번호.
   */
  imp_uid: string;

  /**
   * 서비스로부터의 식별자 키.
   *
   * 아임포트 서버가 아닌, 이를 사용하는 서비스가 자체적으로 발급하고 관리한다.
   */
  merchant_uid: null | string;

  /**
   * 본인인증대상자 성명.
   */
  name: string;

  /**
   * 성별.
   */
  gender: string;

  /**
   * 생년월일.
   *
   * 리눅스 타임이 쓰인다.
   */
  birth: number;

  /**
   * 생년월일, YYYYMMDD 형식.
   */
  birthday: string &
    tags.Pattern<"^([0-9]{4})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$">;

  /**
   * 외국인 여부.
   */
  foreigner: boolean;

  /**
   * 본인인증 대상자 핸드폰 번호.
   */
  phone: string;

  /**
   * 본인인증 대상자 통신사 코드.
   */
  carrier: "SKT" | "KT" | "LGT";

  /**
   * OTP 인증 여부.
   */
  certified: boolean;

  /**
   * OTP 인증 일시.
   *
   * 리눅스 타임이 쓰이며, `null` 대신 0 을 씀.
   */
  certified_at: number;

  /**
   * 뭔지 잘 모름, 용도 아시는 분?
   */
  unique_key: string;

  /**
   * 뭔지 잘 모름, 용도 아시는 분?
   */
  unique_in_site: string;

  /**
   * 뭔지 잘 모름, 용도 아시는 분?
   */
  pg_tid: string;

  /**
   * PG 제공자.
   */
  pg_provider: string;

  /**
   * 뭔지 잘 모름, 용도 아시는 분?
   */
  origin: string;

  /**
   * (테스트 전용) OTP 코드.
   *
   * 오직 `fake-iamport-server` 에서만 쓰이는 속성으로써, 본인인증을 시뮬레이션할 때,
   * 어떠한 OTP 코드가 발급되었는 지를 확인하기 위하여 사용된다. 이를 이용하여
   * {@link functional.certifications.otp.confirm} 함수를 호출하면, 본인인증을 완료할
   * 수 있다.
   */
  __otp?: string;
}
export namespace IIamportCertification {
  /**
   * 본인인증 정보의 접근자 구조체.
   */
  export interface IAccessor {
    /**
     * 본인인증정보의 식별자 키.
     */
    imp_uid: string;
  }

  /**
   * 본인 인증 입력 정보.
   */
  export interface IStore {
    /**
     * 본인인증대상자 성명.
     */
    name: string;

    /**
     * 본인인증 대상자 핸드폰 번호.
     *
     * 핸드폰 번호에 "-" 값이 들어가던 아니던 상관 없음.
     *
     * 다만, 내부적으로는 "-" 값을 제거하여 처리한다.
     */
    phone: string;

    /**
     * 생년월일.
     *
     * YYYYMMDD 형식.
     */
    birth: string &
      tags.Pattern<"^([0-9]{4})(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$">;

    /**
     * 주민등록 뒷부분 첫 자리.
     */
    gender_digit: string;

    /**
     * 본인인증 대상자 통신사 코드.
     */
    carrier: "SKT" | "KT" | "LGT";

    /**
     * 알뜰폰 여부.
     */
    is_mvno?: boolean;

    /**
     * 가맹점 서비스 명칭 또는 domain URL.
     *
     * KISA 에서 대상자에게 발송하는 SMS에 안내될 서비스 명칭.
     */
    commpany?: string;

    /**
     * 귀사 서비스에서의 본인인증 식별자 키.
     *
     * 아임포트 서버가 아닌, 이를 사용하는 서비스가 자체적으로 발급하고 관리한다.
     */
    merchant_uid?: string;

    /**
     * PG 사 구분자.
     *
     * 다날 상점아이디를 2개 이상 동시에 사용하시려는 경우에 설정하면 된다.
     *
     * **danal.{상점아이디}** 형태로 지정.
     */
    pg?: string;
  }

  /**
   * 본인인증 승인을 위한 입력 정보.
   */
  export interface IConfirm {
    /**
     * SMS 로 전송된 본인인증 번호.
     */
    otp: string;
  }
}
