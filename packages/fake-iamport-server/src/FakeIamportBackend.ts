import { NestFactory } from "@nestjs/core";
import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { FakeIamportConfiguration } from "./FakeIamportConfiguration";
import { FakeIamportModule } from "./FakeIamportModule";

/**
 * Fake 아임포트 서버의 백엔드 프로그램.
 *
 * @author Samchon
 */
export class FakeIamportBackend {
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
            await FakeIamportModule(),
            new FastifyAdapter(),
            { logger: false },
        );

        // DO OPEN
        this.application_.enableCors();
        await this.application_.listen(FakeIamportConfiguration.API_PORT);

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
