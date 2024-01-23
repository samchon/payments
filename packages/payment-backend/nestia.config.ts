import type { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from "@nestjs/core";

import { PaymentModule } from "./src/PaymentModule";

const NESTIA_CONFIG: INestiaConfig = {
  input: () => NestFactory.create(PaymentModule),
  output: "src/api",
  distribute: "../payment-api",
  swagger: {
    output: "../payment-api/swagger.json",
  },
};
export default NESTIA_CONFIG;
