/**
 * @packageDocumentation
 * @module api.functional.subscribe.customers
 * @nestia Generated by Nestia - https://github.com/samchon/nestia 
 */
//================================================================
import type { IConnection, Primitive } from "@nestia/fetcher";
import { PlainFetcher } from "@nestia/fetcher/lib/PlainFetcher";

import type { IIamportResponse } from "../../../structures/IIamportResponse";
import type { IIamportSubscription } from "../../../structures/IIamportSubscription";

/**
 * 간편 결제 카드 정보 조회하기.
 * 
 * `subscribe.customers.at` 은 고객이 {@link create } 나 혹은 아임포트가 제공하는
 * 간편 결제 카드 등록 창을 이용하여 저장한 간편 결제 카드 정보를 조회하는 API
 * 함수이다.
 * 
 * @param customer_uid 고객 (간편 결제 카드) 식별자 키
 * @returns 간편 결제 카드 정보
 * @security bearer
 * @author Samchon
 * 
 * @controller FakeIamportSubscribeCustomersController.at
 * @path GET /subscribe/customers/:customer_uid
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function at(
    connection: IConnection,
    customer_uid: string,
): Promise<at.Output> {
    return PlainFetcher.fetch(
        connection,
        {
            ...at.METADATA,
            path: at.path(customer_uid),
        } as const,
    );
}
export namespace at {
    export type Output = Primitive<IIamportResponse<IIamportSubscription>>;

    export const METADATA = {
        method: "GET",
        path: "/subscribe/customers/:customer_uid",
        request: null,
        response: {
            type: "application/json",
            encrypted: false,
        },
        status: null,
    } as const;

    export const path = (customer_uid: string): string => {
        return `/subscribe/customers/${encodeURIComponent(customer_uid ?? "null")}`;
    }
}

/**
 * 간편 결제 카드 등록하기.
 * 
 * `subscribe.customers.stoer` 는 고객이 자신의 카드를 서버에 등록해두고, 매번 결제가
 * 필요할 때마다 카드 정보를 반복 입력하는 일 없이, 간편하게 결제를 진행하고자 할 때
 * 사용하는 API 함수이다.
 * 
 * 참고로 `subscribe.customers.create` 는 클라이언트 어플리케이션이 아임포트가 제공하는
 * 간편 결제 카드 등록 창을 사용하는 경우, 귀하의 백엔드 서버가 이를 실 서비스에서 호출하는
 * 일은 없을 것이다. 다만, 고객이 간편 결제 카드를 등록하는 상황을 시뮬레이션하기 위하여,
 * 테스트 자동화 프로그램 수준에서 사용될 수는 있다.
 * 
 * @param customer_uid 고객 (간편 결제 카드) 식별자 키
 * @param input 카드 입력 정보
 * @returns 간편 결제 카드 정보
 * @security bearer
 * @author Samchon
 * 
 * @controller FakeIamportSubscribeCustomersController.create
 * @path POST /subscribe/customers/:customer_uid
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function create(
    connection: IConnection,
    customer_uid: string,
    input: create.Input,
): Promise<create.Output> {
    return PlainFetcher.fetch(
        {
            ...connection,
            headers: {
                ...(connection.headers ?? {}),
                "Content-Type": "application/json",
            },
        },
        {
            ...create.METADATA,
            path: create.path(customer_uid),
        } as const,
        input,
    );
}
export namespace create {
    export type Input = Primitive<IIamportSubscription.ICreate>;
    export type Output = Primitive<IIamportResponse<IIamportSubscription>>;

    export const METADATA = {
        method: "POST",
        path: "/subscribe/customers/:customer_uid",
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

    export const path = (customer_uid: string): string => {
        return `/subscribe/customers/${encodeURIComponent(customer_uid ?? "null")}`;
    }
}

/**
 * 간편 결제 카드 삭제하기.
 * 
 * 간편 결제를 위하여 등록한 카드를 제거한다.
 * 
 * @param customer_uid 고객 (간편 결제 카드) 식별자 키
 * @returns 삭제된 간편 결제 카드 정보
 * @security bearer
 * @author Samchon
 * 
 * @controller FakeIamportSubscribeCustomersController.erase
 * @path DELETE /subscribe/customers/:customer_uid
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function erase(
    connection: IConnection,
    customer_uid: string,
): Promise<erase.Output> {
    return PlainFetcher.fetch(
        connection,
        {
            ...erase.METADATA,
            path: erase.path(customer_uid),
        } as const,
    );
}
export namespace erase {
    export type Output = Primitive<IIamportResponse<IIamportSubscription>>;

    export const METADATA = {
        method: "DELETE",
        path: "/subscribe/customers/:customer_uid",
        request: null,
        response: {
            type: "application/json",
            encrypted: false,
        },
        status: null,
    } as const;

    export const path = (customer_uid: string): string => {
        return `/subscribe/customers/${encodeURIComponent(customer_uid ?? "null")}`;
    }
}