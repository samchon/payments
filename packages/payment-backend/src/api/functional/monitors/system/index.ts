/**
 * @packageDocumentation
 * @module api.functional.monitors.system
 * @nestia Generated by Nestia - https://github.com/samchon/nestia 
 */
//================================================================
import type { IConnection, Primitive } from "@nestia/fetcher";
import { EncryptedFetcher } from "@nestia/fetcher/lib/EncryptedFetcher";

import type { ISystem } from "../../../structures/monitors/ISystem";

/**
 * @controller MonitorSystemController.get
 * @path GET /monitors/system
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function get(
    connection: IConnection,
): Promise<get.Output> {
    return EncryptedFetcher.fetch(
        connection,
        {
            ...get.METADATA,
            path: get.path(),
        } as const,
    );
}
export namespace get {
    export type Output = Primitive<ISystem>;

    export const METADATA = {
        method: "GET",
        path: "/monitors/system",
        request: null,
        response: {
            type: "text/plain",
            encrypted: true,
        },
        status: null,
    } as const;

    export const path = (): string => {
        return `/monitors/system`;
    }
}