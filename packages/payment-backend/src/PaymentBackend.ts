import { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import FakeIamport from "fake-iamport-server";
import FakeToss from "fake-toss-payments-server";

import { PaymentConfiguration } from "./PaymentConfiguration";
import { PaymentGlobal } from "./PaymentGlobal";
import { PaymentModule } from "./PaymentModule";
import PaymentAPI from "./api";

/**
 * 통합 결제 백엔드 서버.
 *
 * @author Samchon
 */
export class PaymentBackend {
  private application_?: INestApplication;
  private fake_servers_: IFakeServer[] = [];

  /**
   * 서버 개설하기.
   *
   * 통합 결제 백엔드 서버를 개설한다. 이 때 개설되는 서버의 종류는
   * {@link PaymentGlobal.mode} 를 따르며, 만일 개설되는 서버가 테스트 자동화 프로그램에
   * 의하여 시작된 것이라면 ({@link PaymentGlobal.testing} 값이 true), 이와 연동하게 될
   * 가짜 PG 결제사 서버들도 함께 개설한다.
   */
  public async open(): Promise<void> {
    //----
    // OPEN THE BACKEND SERVER
    //----
    // MOUNT CONTROLLERS
    this.application_ = await NestFactory.create(
      PaymentModule,
      new FastifyAdapter(),
      {
        logger: false,
      },
    );

    // DO OPEN
    this.application_.enableCors();
    await this.application_.listen(PaymentConfiguration.API_PORT(), "0.0.0.0");

    // CONFIGURE FAKE SERVERS IF TESTING
    if (PaymentGlobal.testing === true) {
      // OPEN FAKE SERVERS
      this.fake_servers_ = [
        new FakeIamport.FakeIamportBackend(),
        new FakeToss.FakeTossBackend(),
      ];
      for (const server of this.fake_servers_) {
        await server.open();
      }

      // CONFIGURE WEBHOOK URLS
      const host: string = `http://127.0.0.1:${PaymentConfiguration.API_PORT()}`;
      FakeIamport.FakeIamportConfiguration.WEBHOOK_URL = `${host}${PaymentAPI.functional.payments.webhooks.iamport.METADATA.path}`;
      FakeToss.FakeTossConfiguration.WEBHOOK_URL = `${host}${PaymentAPI.functional.payments.webhooks.toss.METADATA.path}`;
    }
  }

  /**
   * 개설한 서버 닫기.
   */
  public async close(): Promise<void> {
    if (this.application_ === undefined) return;

    // DO CLOSE
    await this.application_.close();
    delete this.application_;

    // CLOSE FAKE SERVERS
    for (const server of this.fake_servers_) {
      await server.close();
    }
    this.fake_servers_ = [];
  }
}

interface IFakeServer {
  open(): Promise<void>;
  close(): Promise<void>;
}
