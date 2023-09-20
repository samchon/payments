import core from "@nestia/core";
import * as nest from "@nestjs/common";
import { DomainError } from "tstl/exception/DomainError";
import { InvalidArgument } from "tstl/exception/InvalidArgument";
import { OutOfRange } from "tstl/exception/OutOfRange";

/* eslint-disable */

const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js") require("source-map-support").install();

/**
 * Fake 아임포트 서버의 설정 정보.
 *
 * @author Samchon
 */
export namespace FakeIamportConfiguration {
    /**
     * @internal
     */
    export const ASSETS = __dirname + "/../assets";

    /**
     * 유저 토큰의 유효 시간.
     */
    export const USER_EXPIRATION_TIME: number = -3 * 60 * 1000;

    /**
     * 임시 저장소의 레코드 만료 기한.
     */
    export const STORAGE_EXPIRATION: IExpiration = {
        time: 3 * 60 * 1000,
        capacity: 1000,
    };

    /**
     * 서버가 사용할 포트 번호.
     */
    export let API_PORT: number = 10851;

    /**
     * Webhook 이벤트를 수신할 URL 주소.
     */
    export let WEBHOOK_URL: string = `http://127.0.0.1:${API_PORT}/internal/webhook`;

    /**
     * 토큰 발행 전 인증 함수.
     *
     * 클라이언트가 전송한 api 및 secret key 값이 제대로 된 것인지 판별한다.
     *
     * @param accessor 인증 키 값
     */
    export let authorize: (accessor: IAccessor) => boolean = (accessor) => {
        return (
            accessor.imp_key === "test_imp_key" &&
            accessor.imp_secret === "test_imp_secret"
        );
    };

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

    /**
     * 임시 저장소의 레코드 만료 기한.
     */
    export interface IExpiration {
        /**
         * 만료 시간.
         */
        time: number;

        /**
         * 최대 수용량.
         */
        capacity: number;
    }
}

// CUSTOM EXCEPTIION CONVERSION
core.ExceptionManager.insert(
    OutOfRange,
    (exp) => new nest.NotFoundException(exp.message),
);
core.ExceptionManager.insert(
    InvalidArgument,
    (exp) => new nest.ConflictException(exp.message),
);
core.ExceptionManager.insert(
    DomainError,
    (exp) => new nest.UnprocessableEntityException(exp.message),
);

// TRACE EXACT SERVER INTERNAL ERROR
core.ExceptionManager.insert(
    Error,
    (exp) =>
        new nest.InternalServerErrorException({
            message: exp.message,
            name: exp.name,
            stack: exp.stack,
        }),
);
