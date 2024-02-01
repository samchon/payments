import { ExceptionManager } from "@nestia/core";
import { IEncryptionPassword } from "@nestia/fetcher";
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { IIamportUser } from "iamport-server-api/lib/structures/IIamportUser";
import path from "path";

import { PaymentGlobal } from "./PaymentGlobal";

const EXTENSION = __filename.substr(-2);
if (EXTENSION === "js") require("source-map-support").install();

/**
 * 통합 결제 서버 설정 정보.
 *
 * @author Samchon
 */
export namespace PaymentConfiguration {
  /* -----------------------------------------------------------
        CONNECTIONS
    ----------------------------------------------------------- */
  export const API_PORT = () => Number(PaymentGlobal.env.PAYMENT_API_PORT);
  export const UPDATOR_PORT = () =>
    Number(PaymentGlobal.env.PAYMENT_UPDATOR_PORT);
  export const MASTER_IP = () =>
    PaymentGlobal.mode === "local"
      ? "127.0.0.1"
      : PaymentGlobal.mode === "dev"
        ? "your-dev-server-ip"
        : "your-real-server-master-ip";

  export const ENCRYPTION_PASSWORD = (): Readonly<IEncryptionPassword> => ({
    key: PaymentGlobal.env.PAYMENT_CONNECTION_ENCRYPTION_KEY ?? "",
    iv: PaymentGlobal.env.PAYMENT_CONNECTION_ENCRYPTION_IV ?? "",
  });
  export const SYSTEM_PASSWORD = () =>
    PaymentGlobal.env.PAYMENT_SYSTEM_PASSWORD;

  /* -----------------------------------------------------------
        VENDORS
    ----------------------------------------------------------- */
  /**
   * 아임포트의 API 및 시크릿 키 getter 함수.
   *
   * `IAMPORT_USER_ACCESSOR` 는 아임포트에 사용할 API 및 시크릿 키를 리턴해주는 getter
   * 함수로써, 귀하는 이 함수를 수정하여, 아임포트로부터 발급받은 API 및 시크릿 키를
   * 리턴하도록 한다.
   *
   * 만일 귀사의 서비스가 아임포트로부터 복수의 스토어 ID 를 발급받았다면, 이 또한
   * 고려하여 리턴되는 API 및 시크릿 키 값을 정해주도록 한다. 또한,
   * {@link PaymentGlobal.testing 테스트 용도} 내지 {@link PaymentGlobal.mode 개발 서버}
   * 전용으로 발급받은 스토어 ID 또한 존재한다면, 이 또한 고려토록 한다.
   *
   * @param storeId 스토어 ID
   * @returns 아임포트의 API 및 시크릿 키
   */
  export const IAMPORT_USER_ACCESSOR = (
    storeId: string,
  ): IIamportUser.IAccessor => {
    storeId;
    return {
      imp_key: PaymentGlobal.env.PAYMENT_IAMPORT_KEY,
      imp_secret: PaymentGlobal.env.PAYMENT_IAMPORT_SECRET,
    };
  };

  /**
   * 토스 페이먼츠의 시크릿 키 getter 함수.
   *
   * `TOSS_SECRET_KEY` 는 토스 페이먼츠에 사용할 시크릿 키를 리턴해주는 getter 함수로써,
   * 귀하는 이 함수를 수정하여, 토스 페이먼츠로부터 발급받은 시크릿 키를 리턴하도록 한다.
   *
   * 만일 귀사의 서비스가 토스 페이먼츠로부터 복수의 스토어 ID 를 발급받았다면, 이 또한
   * 고려하여 리턴되는 시크릿 키 값을 정해주도록 한다. 또한,
   * {@link PaymentGlobal.testing 테스트 용도} 내지 {@link PaymentGlobal.mode 개발 서버}
   * 전용으로 발급받은 스토어 ID 또한 존재한다면, 이 또한 고려토록 한다.
   *
   * @param storeId 스토어 ID
   * @returns 토스 페이먼츠의 시크릿 키
   */
  export const TOSS_SECRET_KEY = (storeId: string): string => {
    storeId;
    return PaymentGlobal.env.PAYMENT_TOSS_PAYMENTS_SECRET;
  };

  /**
   * @internal
   */
  export const ROOT = (() => {
    const splitted: string[] = __dirname.split(path.sep);
    return splitted[splitted.length - 1] === "src" &&
      splitted[splitted.length - 2] === "bin"
      ? path.resolve(__dirname + "/../..")
      : path.resolve(__dirname + "/..");
  })();

  /**
   * @internal
   */
  export const CREATED_AT: Date = new Date();
}

// CUSTOM EXCEPTIION CONVERSION
ExceptionManager.insert(Prisma.PrismaClientKnownRequestError, (exp) => {
  switch (exp.code) {
    case "P2025":
      return new NotFoundException(exp.message);
    case "P2002": // UNIQUE CONSTRAINT
      return new ConflictException(exp.message);
    default:
      return new InternalServerErrorException(exp.message);
  }
});
