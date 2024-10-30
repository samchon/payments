import type { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { FakeIamportModule } from "./src/FakeIamportModule";

const NESTIA_CONFIG: INestiaConfig = {
  input: () => NestFactory.create(FakeIamportModule, new FastifyAdapter()),
  output: "src/api",
  distribute: "packages/api",
  swagger: {
    output: "packages/api/swagger.json",
    info: {
      title: "Iamport API",
      description:
        "Built by [fake-iamport-server](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server) with [nestia](https://github.com/samchon/nestia)",
    },
    servers: [
      {
        url: "https://api.iamport.kr",
        description: "real",
      },
      {
        url: "http://localhost:10851",
        description: "fake",
      },
    ],
    security: {
      bearer: {
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
