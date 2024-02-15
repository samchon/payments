import type { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { FakeTossModule } from "./src/FakeTossModule";

const NESTIA_CONFIG: INestiaConfig = {
  input: () => NestFactory.create(FakeTossModule, new FastifyAdapter()),
  output: "src/api",
  distribute: "../toss-payments-server-api",
  swagger: {
    output: "../toss-payments-server-api/swagger.json",
    info: {
      title: "Toss Payments API",
      description:
        "Built by [fake-toss-payments-server](https://github.com/samchon/payments/tree/master/packages/toss-payments-server-api) with [nestia](https://github.com/samchon/nestia)",
    },
    servers: [
      {
        url: "http://localhost:30771",
        description: "fake",
      },
      {
        url: "https://api.tosspayments.com",
        description: "real",
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
