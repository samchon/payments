/**
 * 아임포트 고유의 응답 데이터.
 *
 * @author Samchon
 */
export interface IIamportResponse<T extends object> {
  /**
   * 에러 코드.
   *
   * 값이 0 이면 오류가 없다는 뜻.
   */
  code: number;

  /**
   * 성공 또는 오류 메시지.
   */
  message: string;

  /**
   * 응답 데이터, 사실상 본문.
   */
  response: T;
}
