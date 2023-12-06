/**
 * @packageDocumentation
 * @module api.functional.v1.cash_receipts
 * @nestia Generated by Nestia - https://github.com/samchon/nestia 
 */
//================================================================
import type { IConnection, Primitive } from "@nestia/fetcher";
import { PlainFetcher } from "@nestia/fetcher/lib/PlainFetcher";
import typia from "typia";

import type { ITossCashReceipt } from "../../../structures/ITossCashReceipt";
import { NestiaSimulator } from "../../../utils/NestiaSimulator";

/**
 * 현금 영수증 발행하기.
 * 
 * @param input 입력 정보
 * @returns 현금 영수증 정보
 * @security basic
 * @author Samchon
 * 
 * @controller FakeTossCashReceiptsController.create
 * @path POST /v1/cash-receipts
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
    export type Input = Primitive<ITossCashReceipt.ICreate>;
    export type Output = Primitive<ITossCashReceipt>;

    export const METADATA = {
        method: "POST",
        path: "/v1/cash-receipts",
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
        return `/v1/cash-receipts`;
    }
    export const random = (g?: Partial<typia.IRandomGenerator>): Primitive<ITossCashReceipt> =>
        typia.random<Primitive<ITossCashReceipt>>(g);
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

/**
 * 현금 영수증 취소하기.
 * 
 * @param receiptKey 현금 영수증의 {@link ITossCashReceipt.receiptKey}
 * @param input 취소 입력 정보
 * @returns 취소된 현금 영수증 정보
 * @security basic
 * @author Samchon
 * 
 * @controller FakeTossCashReceiptsController.cancel
 * @path POST /v1/cash-receipts/:receiptKey/cancel
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function cancel(
    connection: IConnection,
    receiptKey: string,
    input: cancel.Input,
): Promise<cancel.Output> {
    return !!connection.simulate
        ? cancel.simulate(
              connection,
              receiptKey,
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
                  ...cancel.METADATA,
                  path: cancel.path(receiptKey),
              } as const,
              input,
          );
}
export namespace cancel {
    export type Input = Primitive<ITossCashReceipt.ICancel>;
    export type Output = Primitive<ITossCashReceipt>;

    export const METADATA = {
        method: "POST",
        path: "/v1/cash-receipts/:receiptKey/cancel",
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

    export const path = (receiptKey: string): string => {
        return `/v1/cash-receipts/${encodeURIComponent(receiptKey ?? "null")}/cancel`;
    }
    export const random = (g?: Partial<typia.IRandomGenerator>): Primitive<ITossCashReceipt> =>
        typia.random<Primitive<ITossCashReceipt>>(g);
    export const simulate = async (
        connection: IConnection,
        receiptKey: string,
        input: cancel.Input,
    ): Promise<Output> => {
        const assert = NestiaSimulator.assert({
            method: METADATA.method,
            host: connection.host,
            path: path(receiptKey),
            contentType: "application/json",
        });
        assert.param("receiptKey")(() => typia.assert(receiptKey));
        assert.body(() => typia.assert(input));
        return random(
            typeof connection.simulate === 'object' &&
                connection.simulate !== null
                ? connection.simulate
                : undefined
        );
    }
}