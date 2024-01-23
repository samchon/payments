import type { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from "@nestjs/core";

import { FakeIamportModule } from "./src/FakeIamportModule";

const NESTIA_CONFIG: INestiaConfig = {
  input: () => NestFactory.create(FakeIamportModule),
  output: "src/api",
  distribute: "../iamport-server-api",
  swagger: {
    output: "../iamport-server-api/swagger.json",
    info: {
      title: "Iamport API",
      description:
        "Built by [fake-iamport-server](https://github.com/samchon/payments/tree/master/packages/fake-iamport-server) with [nestia](https://github.com/samchon/nestia)",
    },
    servers: [
      {
        url: "http://localhost:10851",
        description: "fake",
      },
      {
        url: "https://api.iamport.kr",
        description: "real",
      },
    ],
    security: {
      bearer: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
  },
};
export default NESTIA_CONFIG;
