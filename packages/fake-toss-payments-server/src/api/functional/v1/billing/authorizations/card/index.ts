/**
 * @packageDocumentation
 * @module api.functional.v1.billing.authorizations.card
 * @nestia Generated by Nestia - https://github.com/samchon/nestia 
 */
//================================================================
import type { IConnection, Primitive } from "@nestia/fetcher";
import { PlainFetcher } from "@nestia/fetcher/lib/PlainFetcher";
import typia from "typia";

import type { ITossBilling } from "../../../../../structures/ITossBilling";
import { NestiaSimulator } from "../../../../../utils/NestiaSimulator";

/**
 * 간편 결제 카드 등록하기.
 * 
 * `billing.authorizations.card.create` 는 고객이 자신의 신록 카드를 서버에 등록해두고,
 * 매번 결제가 필요할 때마다 카드 정보를 반복 입력하는 일 없이 간편하게 결제를
 * 진행하고자 할 때, 호출되는 API 함수이다.
 * 
 * 참고로 `billing.authorizations.card.create` 는 클라이언트 어플리케이션이 토스
 * 페이먼츠가 제공하는 간편 결제 카드 등록 창을 사용하는 경우, 귀하의 백엔드 서버가 이를
 * 실 서비스에서 호출하는 일은 없을 것이다. 다만, 고객이 간편 결제 카드를 등록하는
 * 상황을 시뮬레이션하기 위하여, 테스트 자동화 프로그램 수준에서 사용될 수는 있다.
 * 
 * @param input 간편 결제 카드 등록 정보
 * @returns 간편 결제 카드 정보
 * @security basic
 * @author Samchon
 * 
 * @controller FakeTossBillingController.create
 * @path POST /v1/billing/authorizations/card
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function create(
    connection: IConnection,
    input: create.Input,
): Promise<create.Output> {
    return !!connection.simulate
        ? create.simulate(
              connection,
              input,
          )
        : PlainFetcher.fetch(
              {
                  ...connection,
                  headers: {
                      ...(connection.headers ?? {}),
                      "Content-Type": "application/json",
                  },
              },
              {
                  ...create.METADATA,
                  path: create.path(),
              } as const,
              input,
          );
}
export namespace create {
    export type Input = Primitive<ITossBilling.ICreate>;
    export type Output = Primitive<ITossBilling>;

    export const METADATA = {
        method: "POST",
        path: "/v1/billing/authorizations/card",
        request: {
            type: "application/json",
            encrypted: false
        },
        response: {
            type: "application/json",
            encrypted: false,
        },
        status: null,
    } as const;

    export const path = (): string => {
        return `/v1/billing/authorizations/card`;
    }
    export const random = (g?: Partial<typia.IRandomGenerator>): Primitive<ITossBilling> =>
        typia.random<Primitive<ITossBilling>>(g);
    export const simulate = async (
        connection: IConnection,
        input: create.Input,
    ): Promise<Output> => {
        const assert = NestiaSimulator.assert({
            method: METADATA.method,
            host: connection.host,
            path: path(),
            contentType: "application/json",
        });
        assert.body(() => typia.assert(input));
        return random(
            typeof connection.simulate === 'object' &&
                connection.simulate !== null
                ? connection.simulate
                : undefined
        );
    }
}