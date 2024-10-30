import type { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { FakeTossModule } from "./src/FakeTossModule";

const NESTIA_CONFIG: INestiaConfig = {
  input: () => NestFactory.create(FakeTossModule, new FastifyAdapter()),
  output: "src/api",
  distribute: "packages/api",
  swagger: {
    output: "packages/api/swagger.json",
    info: {
      title: "Toss Payments API",
      description:
        "Built by [fake-toss-payments-server](https://github.com/samchon/payments/tree/master/packages/toss-payments-server-api) with [nestia](https://github.com/samchon/nestia)",
    },
    servers: [
      {
        url: "https://api.tosspayments.com",
        description: "real",
      },
      {
        url: "http://localhost:30771",
        description: "fake",
      },
    ],
    security: {
      basic: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
    beautify: true,
  },
  primitive: false,
};
export default NESTIA_CONFIG;
