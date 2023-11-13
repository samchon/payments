/**
 * 아임포트 유저 인증 정보.
 *
 * 아임포트는 고객사에게 API 및 secret 키 정보, {@link IIamportUser.IAccessor} 를 발급해준다.
 *
 * 하지만 이를 곧장 아임포트의 유저 인증에 사용할 수는 없고, 해당 API 및 secret 키를 토대로 유저
 * 인증 토큰을 발급받아야 하는데, 이 유저 인증 토큰에는 하필이면 만로 시간이라는 게 존재한다.
 * `IIamportUser` 는 바로 이러한 유저 인증 토큰 및 그것의 만료 시간을 형상화한 자료구조
 * 인터페이스이다.
 *
 * 더하여 이처럼 만료 시간이 존재하는 아임포트의 유저 인증 토큰의 특성상, 이것의 만료 시간이
 * 초과되지 않도록 관리하는 것은 매우 힘든 일이다. 이에 `iamport-server-api` 에서는 아임포트
 * 유저 인증 토큰이 만료될 때마다 자동 갱신해주는, {@link IamportConnector} 클래스를 제공한다.
 *
 * @author Samchon
 */
export interface IIamportUser {
  /**
   * 토큰 발행 시간.
   */
  now: number;

  /**
   * 토큰 만료 시간.
   *
   * 리눅스 타임이 기준이며, 이를 JS 에서 사용하려거든, 아래와 같이 변환해야 한다.
   *
   * ```typescript
   * new Date(user.expired_at * 1_000);
   * ```
   */
  expired_at: number;

  /**
   * 유저 인증 토큰.
   */
  access_token: string;
}
export namespace IIamportUser {
  /**
   * 아임포트에서 부여해 준 API 및 secret 키.
   */
  export interface IAccessor {
    /**
     * API 키.
     */
    imp_key: string;

    /**
     * Secret 키.
     */
    imp_secret: string;
  }
}
