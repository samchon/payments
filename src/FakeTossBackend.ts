import core from "@nestia/core";
import { NestFactory } from "@nestjs/core";
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { TossFakeConfiguration } from "./FakeTossConfiguration";

/**
 * Fake 토스 페이먼츠 서버의 백엔드 프로그램.
 *
 * @author Jeongho Nam - https://github.com/samchon
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
            await core.DynamicModule.mount(`${__dirname}/controllers`),
            new FastifyAdapter(),
            { logger: false },
        );

        // DO OPEN
        this.application_.enableCors();
        await this.application_.listen(TossFakeConfiguration.API_PORT);

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
