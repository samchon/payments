/**
 * @packageDocumentation
 * @module api.functional.users
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
//================================================================
import type { IConnection } from "@nestia/fetcher";
import { PlainFetcher } from "@nestia/fetcher/lib/PlainFetcher";

import type { IIamportResponse } from "../../structures/IIamportResponse";
import type { IIamportUser } from "../../structures/IIamportUser";

/**
 * 유저 인증 토큰 발행하기.
 *
 * 아임포트에 가입하여 부여받은 API 및 secret 키를 토대로, 유저 인증 토큰을 발행한다.
 *
 * 단, 아임포트가 발급해주는 유저 인증 토큰에는 유효 시간 {@link IIamportUser.expired_at }
 * 이 있어, 해당 시간이 지나거든 기 발급 토큰이 만료되어 더 이상 쓸 수 없게 된다. 때문에
 * 아임포트의 이러한 시간 제한에 구애받지 않고 자유로이 아임포트의 API 를 이용하고 싶다면,
 * `iamport-server-api` 에서 제공해주는 {@link IamportConnector } 를 활용하도록 하자.
 *
 * @param input 아임포트의 API 및 secret 키 정보
 * @returns 유저 인증 토큰 정보
 * @author Samchon
 *
 * @controller FakeIamportUsersController.
 * @path POST /users/getToken
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function getToken(
  connection: IConnection,
  input: IIamportUser.IAccessor,
): Promise<getToken.Output> {
  return PlainFetcher.fetch(
    {
      ...connection,
      headers: {
        ...connection.headers,
        "Content-Type": "application/json",
      },
    },
    {
      ...getToken.METADATA,
      path: getToken.path(),
    },
    input,
  );
}
export namespace getToken {
  export type Input = IIamportUser.IAccessor;
  export type Output = IIamportResponse<IIamportUser>;

  export const METADATA = {
    method: "POST",
    path: "/users/getToken",
    request: {
      type: "application/json",
      encrypted: false,
    },
    response: {
      type: "application/json",
      encrypted: false,
    },
    status: null,
  } as const;

  export const path = () => "/users/getToken";
}
