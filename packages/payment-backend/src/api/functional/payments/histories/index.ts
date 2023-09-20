/**
 * @packageDocumentation
 * @module api.functional.payments.histories
 * @nestia Generated by Nestia - https://github.com/samchon/nestia 
 */
//================================================================
import type { IConnection, Primitive } from "@nestia/fetcher";
import { EncryptedFetcher } from "@nestia/fetcher/lib/EncryptedFetcher";
import typia from "typia";
import type { Format } from "typia/lib/tags/Format";

import type { IPaymentCancelHistory } from "../../../structures/payments/IPaymentCancelHistory";
import type { IPaymentHistory } from "../../../structures/payments/IPaymentHistory";
import type { IPaymentSource } from "../../../structures/payments/IPaymentSource";
import { NestiaSimulator } from "../../../utils/NestiaSimulator";

/**
 * 결제 내역 상세 조회하기.
 * 
 * @param input 결제 내역의 원천 정보 + 비밀번호
 * @returns 결제 내역
 * @author Samchon
 * 
 * @controller PaymentHistoriesController.get
 * @path PATCH /payments/histories/get
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function get(
    connection: IConnection,
    input: get.Input,
): Promise<get.Output> {
    return !!connection.simulate
        ? get.simulate(
              connection,
              input,
          )
        : EncryptedFetcher.fetch(
              {
                  ...connection,
                  headers: {
                      ...(connection.headers ?? {}),
                      "Content-Type": "text/plain",
                  },
              },
              {
                  ...get.METADATA,
                  path: get.path(),
              } as const,
              input,
          );
}
export namespace get {
    export type Input = Primitive<IPaymentSource.IAccessor>;
    export type Output = Primitive<IPaymentHistory>;

    export const METADATA = {
        method: "PATCH",
        path: "/payments/histories/get",
        request: {
            type: "text/plain",
            encrypted: true
        },
        response: {
            type: "text/plain",
            encrypted: true,
        },
        status: null,
    } as const;

    export const path = (): string => {
        return `/payments/histories/get`;
    }
    export const random = (g?: Partial<typia.IRandomGenerator>): Primitive<IPaymentHistory> =>
        typia.random<Primitive<IPaymentHistory>>(g);
    export const simulate = async (
        connection: IConnection,
        input: get.Input,
    ): Promise<Output> => {
        const assert = NestiaSimulator.assert({
            method: METADATA.method,
            host: connection.host,
            path: path(),
            contentType: "text/plain",
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
 * 결제 내역 상세 조회하기.
 * 
 * @param id Primary Key
 * @param input 결제 내역의 비밀번호
 * @returns 결제 내역
 * @author Samchon
 * 
 * @controller PaymentHistoriesController.at
 * @path PATCH /payments/histories/:id
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function at(
    connection: IConnection,
    id: string & Format<"uuid">,
    input: at.Input,
): Promise<at.Output> {
    return !!connection.simulate
        ? at.simulate(
              connection,
              id,
              input,
          )
        : EncryptedFetcher.fetch(
              {
                  ...connection,
                  headers: {
                      ...(connection.headers ?? {}),
                      "Content-Type": "text/plain",
                  },
              },
              {
                  ...at.METADATA,
                  path: at.path(id),
              } as const,
              input,
          );
}
export namespace at {
    export type Input = Primitive<IPaymentSource.IPassword>;
    export type Output = Primitive<IPaymentHistory>;

    export const METADATA = {
        method: "PATCH",
        path: "/payments/histories/:id",
        request: {
            type: "text/plain",
            encrypted: true
        },
        response: {
            type: "text/plain",
            encrypted: true,
        },
        status: null,
    } as const;

    export const path = (id: string & Format<"uuid">): string => {
        return `/payments/histories/${encodeURIComponent(id ?? "null")}`;
    }
    export const random = (g?: Partial<typia.IRandomGenerator>): Primitive<IPaymentHistory> =>
        typia.random<Primitive<IPaymentHistory>>(g);
    export const simulate = async (
        connection: IConnection,
        id: string & Format<"uuid">,
        input: at.Input,
    ): Promise<Output> => {
        const assert = NestiaSimulator.assert({
            method: METADATA.method,
            host: connection.host,
            path: path(id),
            contentType: "text/plain",
        });
        assert.param("id")(() => typia.assert(id));
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
 * 결제 내역 발행하기.
 * 
 * @param input 결제 내역 입력 정보
 * @returns 결제 내역
 * @author Samchon
 * 
 * @controller PaymentHistoriesController.store
 * @path POST /payments/histories
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
        : EncryptedFetcher.fetch(
              {
                  ...connection,
                  headers: {
                      ...(connection.headers ?? {}),
                      "Content-Type": "text/plain",
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
    export type Input = Primitive<IPaymentHistory.IStore>;
    export type Output = Primitive<IPaymentHistory>;

    export const METADATA = {
        method: "POST",
        path: "/payments/histories",
        request: {
            type: "text/plain",
            encrypted: true
        },
        response: {
            type: "text/plain",
            encrypted: true,
        },
        status: null,
    } as const;

    export const path = (): string => {
        return `/payments/histories`;
    }
    export const random = (g?: Partial<typia.IRandomGenerator>): Primitive<IPaymentHistory> =>
        typia.random<Primitive<IPaymentHistory>>(g);
    export const simulate = async (
        connection: IConnection,
        input: store.Input,
    ): Promise<Output> => {
        const assert = NestiaSimulator.assert({
            method: METADATA.method,
            host: connection.host,
            path: path(),
            contentType: "text/plain",
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
 * 결제 취소하기.
 * 
 * @param input 결제 취소 내역 입력 정보
 * @author Samchon
 * 
 * @controller PaymentHistoriesController.cancel
 * @path PUT /payments/histories/cancel
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function cancel(
    connection: IConnection,
    input: cancel.Input,
): Promise<cancel.Output> {
    return !!connection.simulate
        ? cancel.simulate(
              connection,
              input,
          )
        : EncryptedFetcher.fetch(
              {
                  ...connection,
                  headers: {
                      ...(connection.headers ?? {}),
                      "Content-Type": "text/plain",
                  },
              },
              {
                  ...cancel.METADATA,
                  path: cancel.path(),
              } as const,
              input,
          );
}
export namespace cancel {
    export type Input = Primitive<IPaymentCancelHistory.IStore>;
    export type Output = Primitive<IPaymentHistory>;

    export const METADATA = {
        method: "PUT",
        path: "/payments/histories/cancel",
        request: {
            type: "text/plain",
            encrypted: true
        },
        response: {
            type: "text/plain",
            encrypted: true,
        },
        status: null,
    } as const;

    export const path = (): string => {
        return `/payments/histories/cancel`;
    }
    export const random = (g?: Partial<typia.IRandomGenerator>): Primitive<IPaymentHistory> =>
        typia.random<Primitive<IPaymentHistory>>(g);
    export const simulate = async (
        connection: IConnection,
        input: cancel.Input,
    ): Promise<Output> => {
        const assert = NestiaSimulator.assert({
            method: METADATA.method,
            host: connection.host,
            path: path(),
            contentType: "text/plain",
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