/**
 * @packageDocumentation
 * @module api.functional.certifications
 * @nestia Generated by Nestia - https://github.com/samchon/nestia 
 */
//================================================================
import type { IConnection, Primitive } from "@nestia/fetcher";
import { PlainFetcher } from "@nestia/fetcher/lib/PlainFetcher";
import typia from "typia";

import type { IIamportCertification } from "../../structures/IIamportCertification";
import type { IIamportResponse } from "../../structures/IIamportResponse";
import { NestiaSimulator } from "../../utils/NestiaSimulator";

export * as otp from "./otp";

/**
 * 본인인증 정보 열람하기.
 * 
 * `certiciations.at` 은 본인인증 정보를 열람할 때 사용하는 API 함수이다.
 * 
 * 다만 이 API 함수를 통하여 열람한 본인인증 정보 {@link IIamportCertification } 이
 * 곧 OTP 인증까지 마쳐 본인인증을 모두 마친 레코드라는 보장은 없다. 본인인증의 완결
 * 여부는 오직, {@link IIamportCertification.certified } 값을 직접 검사해봐야만 알
 * 수 있기 때문이다.
 * 
 * @param imp_uid 대상 본인인증 정보의 {@link IIamportCertification.imp_uid}
 * @returns 본인인증 정보
 * @security bearer
 * @author Samchon
 * 
 * @controller FakeIamportCertificationsController.at
 * @path GET /certifications/:imp_uid
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function at(
    connection: IConnection,
    imp_uid: string,
): Promise<at.Output> {
    return !!connection.simulate
        ? at.simulate(
              connection,
              imp_uid,
          )
        : PlainFetcher.fetch(
              connection,
              {
                  ...at.METADATA,
                  path: at.path(imp_uid),
              } as const,
          );
}
export namespace at {
    export type Output = Primitive<IIamportResponse<IIamportCertification>>;

    export const METADATA = {
        method: "GET",
        path: "/certifications/:imp_uid",
        request: null,
        response: {
            type: "application/json",
            encrypted: false,
        },
        status: null,
    } as const;

    export const path = (imp_uid: string): string => {
        return `/certifications/${encodeURIComponent(imp_uid ?? "null")}`;
    }
    export const random = (g?: Partial<typia.IRandomGenerator>): Primitive<IIamportResponse<IIamportCertification>> =>
        typia.random<Primitive<IIamportResponse<IIamportCertification>>>(g);
    export const simulate = async (
        connection: IConnection,
        imp_uid: string,
    ): Promise<Output> => {
        const assert = NestiaSimulator.assert({
            method: METADATA.method,
            host: connection.host,
            path: path(imp_uid),
            contentType: "application/json",
        });
        assert.param("imp_uid")(() => typia.assert(imp_uid));
        return random(
            typeof connection.simulate === 'object' &&
                connection.simulate !== null
                ? connection.simulate
                : undefined
        );
    }
}

/**
 * 본인인증 정보 삭제하기.
 * 
 * @param imp_uid 대상 본인인증 정보의 {@link IIamportCertification.imp_uid}
 * @returns 삭제된 본인인증 정보
 * @security bearer
 * @author Samchon
 * 
 * @controller FakeIamportCertificationsController.erase
 * @path DELETE /certifications/:imp_uid
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function erase(
    connection: IConnection,
    imp_uid: string,
): Promise<erase.Output> {
    return !!connection.simulate
        ? erase.simulate(
              connection,
              imp_uid,
          )
        : PlainFetcher.fetch(
              connection,
              {
                  ...erase.METADATA,
                  path: erase.path(imp_uid),
              } as const,
          );
}
export namespace erase {
    export type Output = Primitive<IIamportResponse<IIamportCertification>>;

    export const METADATA = {
        method: "DELETE",
        path: "/certifications/:imp_uid",
        request: null,
        response: {
            type: "application/json",
            encrypted: false,
        },
        status: null,
    } as const;

    export const path = (imp_uid: string): string => {
        return `/certifications/${encodeURIComponent(imp_uid ?? "null")}`;
    }
    export const random = (g?: Partial<typia.IRandomGenerator>): Primitive<IIamportResponse<IIamportCertification>> =>
        typia.random<Primitive<IIamportResponse<IIamportCertification>>>(g);
    export const simulate = async (
        connection: IConnection,
        imp_uid: string,
    ): Promise<Output> => {
        const assert = NestiaSimulator.assert({
            method: METADATA.method,
            host: connection.host,
            path: path(imp_uid),
            contentType: "application/json",
        });
        assert.param("imp_uid")(() => typia.assert(imp_uid));
        return random(
            typeof connection.simulate === 'object' &&
                connection.simulate !== null
                ? connection.simulate
                : undefined
        );
    }
}