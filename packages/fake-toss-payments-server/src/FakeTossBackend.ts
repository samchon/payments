import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { FakeTossConfiguration } from "./FakeTossConfiguration";
import { FakeTossModule } from "./FakeTossModule";

/**
 * Fake 토스 페이먼츠 서버의 백엔드 프로그램.
 *
 * @author Samchon
 */
export class FakeTossBackend {
  private application_?: NestFastifyApplication;

  /**
   * 서버 개설.
   */
  public async open(): Promise<void> {
    //----
    // OPEN THE BACKEND SERVER
    //----
    // MOUNT CONTROLLERS
    this.application_ = await NestFactory.create(
      FakeTossModule,
      new FastifyAdapter(),
      { logger: false },
    );

    // DO OPEN
    this.application_.enableCors();
    await this.application_.listen(FakeTossConfiguration.API_PORT, "0.0.0.0");

    //----
    // POST-PROCESSES
    //----
    // INFORM TO THE PM2
    if (process.send) process.send("ready");

    // WHEN KILL COMMAND COMES
    process.on("SIGINT", async () => {
      await this.close();
      process.exit(0);
    });
  }

  /**
   * 서버 폐쇄.
   */
  public async close(): Promise<void> {
    if (this.application_ === undefined) return;

    // DO CLOSE
    await this.application_.close();
    delete this.application_;
  }
}
