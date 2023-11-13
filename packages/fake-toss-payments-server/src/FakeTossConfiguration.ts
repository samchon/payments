import core from "@nestia/core";
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { DomainError } from "tstl/exception/DomainError";
import { InvalidArgument } from "tstl/exception/InvalidArgument";
import { OutOfRange } from "tstl/exception/OutOfRange";

/* eslint-disable */

const EXTENSION = __filename.substring(__filename.length - 2);
if (EXTENSION === "js") require("source-map-support").install();

/**
 * Fake 토스 페이먼츠 서버의 설정 정보.
 *
 * @author Samchon
 */
export namespace FakeTossConfiguration {
  /**
   * @internal
   */
  export const ASSETS = __dirname + "/../assets";

  /**
   * 임시 저장소의 레코드 만료 기한.
   */
  export const EXPIRATION: IExpiration = {
    time: 3 * 60 * 1000,
    capacity: 1000,
  };

  /**
   * 서버가 사용할 포트 번호.
   */
  export let API_PORT: number = 30771;

  /**
   * Webhook 이벤트를 수신할 URL 주소.
   */
  export let WEBHOOK_URL: string = `http://127.0.0.1:${API_PORT}/internal/webhook`;

  /**
   * 토큰 인증 함수.
   *
   * 클라이언트가 전송한 Basic 토큰값이 제대로 된 것인지 판별한다.
   *
   * @param token 토큰값
   */
  export let authorize: (token: string) => boolean = (token) => {
    return token === "test_ak_ZORzdMaqN3wQd5k6ygr5AkYXQGwy";
  };

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
  (exp) => new NotFoundException(exp.message),
);
core.ExceptionManager.insert(
  InvalidArgument,
  (exp) => new ConflictException(exp.message),
);
core.ExceptionManager.insert(
  DomainError,
  (exp) => new UnprocessableEntityException(exp.message),
);

// TRACE EXACT SERVER INTERNAL ERROR
core.ExceptionManager.insert(
  Error,
  (exp) =>
    new InternalServerErrorException({
      message: exp.message,
      name: exp.name,
      stack: exp.stack,
    }),
);
