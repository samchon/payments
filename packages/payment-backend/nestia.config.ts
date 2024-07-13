import type { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";

import { PaymentModule } from "./src/PaymentModule";

const NESTIA_CONFIG: INestiaConfig = {
  input: () => NestFactory.create(PaymentModule, new FastifyAdapter()),
  output: "src/api",
  distribute: "packages/api",
  swagger: {
    output: "packages/api/swagger.json",
    beautify: true,
  },
  primitive: false,
};
export default NESTIA_CONFIG;
