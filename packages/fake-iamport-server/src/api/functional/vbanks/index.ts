/**
 * @packageDocumentation
 * @module api.functional.vbanks
 * @nestia Generated by Nestia - https://github.com/samchon/nestia 
 */
//================================================================
import type { IConnection, Primitive } from "@nestia/fetcher";
import { PlainFetcher } from "@nestia/fetcher/lib/PlainFetcher";
import typia from "typia";

import type { IIamportResponse } from "../../structures/IIamportResponse";
import type { IIamportVBankPayment } from "../../structures/IIamportVBankPayment";
import { NestiaSimulator } from "../../utils/NestiaSimulator";

/**
 * 가상 계좌 발급하기.
 * 
 * @param input 가상 계좌 입력 정보
 * @returns 가상 계좌 결제 정보
 * @security bearer
 * @author Samchon
 * 
 * @controller FakeIamportVbanksController.store
 * @path POST /vbanks
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function store(
    connection: IConnection,
    input: store.Input,
): Promise<store.Output> {
    return !!connection.simulate
        ? store.simulate(
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
                  ...store.METADATA,
                  path: store.path(),
              } as const,
              input,
          );
}
export namespace store {
    export type Input = Primitive<IIamportVBankPayment.IStore>;
    export type Output = Primitive<IIamportResponse<IIamportVBankPayment>>;

    export const METADATA = {
        method: "POST",
        path: "/vbanks",
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
        return `/vbanks`;
    }
    export const random = (g?: Partial<typia.IRandomGenerator>): Primitive<IIamportResponse<IIamportVBankPayment>> =>
        typia.random<Primitive<IIamportResponse<IIamportVBankPayment>>>(g);
    export const simulate = async (
        connection: IConnection,
        input: store.Input,
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

/**
 * 가상 계좌 편집하기.
 * 
 * @param input 가상 계좌 편집 입력 정보
 * @returns 편집된 가상 계좌 결제 정보
 * @security bearer
 * @author Samchon
 * 
 * @controller FakeIamportVbanksController.update
 * @path PUT /vbanks
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function update(
    connection: IConnection,
    input: update.Input,
): Promise<update.Output> {
    return !!connection.simulate
        ? update.simulate(
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
                  ...update.METADATA,
                  path: update.path(),
              } as const,
              input,
          );
}
export namespace update {
    export type Input = Primitive<IIamportVBankPayment.IUpdate>;
    export type Output = Primitive<IIamportResponse<IIamportVBankPayment>>;

    export const METADATA = {
        method: "PUT",
        path: "/vbanks",
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
        return `/vbanks`;
    }
    export const random = (g?: Partial<typia.IRandomGenerator>): Primitive<IIamportResponse<IIamportVBankPayment>> =>
        typia.random<Primitive<IIamportResponse<IIamportVBankPayment>>>(g);
    export const simulate = async (
        connection: IConnection,
        input: update.Input,
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