import core from "@nestia/core";

import { PaymentConfiguration } from "./PaymentConfiguration";
import { MonitorHealthController } from "./controllers/monitors/MonitorHealthController";
import { MonitorPerformanceController } from "./controllers/monitors/MonitorPerformanceController";
import { MonitorSystemController } from "./controllers/monitors/MonitorSystemController";
import { PaymentHistoriesController } from "./controllers/payments/PaymentHistoriesController";
import { PaymentInternalController } from "./controllers/payments/PaymentInternalController";
import { PaymentReservationsController } from "./controllers/payments/PaymentReservationsController";
import { PaymentWebhooksController } from "./controllers/payments/PaymentWebhooksController";

@core.EncryptedModule(
  {
    controllers: [
      MonitorHealthController,
      MonitorPerformanceController,
      MonitorSystemController,

      PaymentHistoriesController,
      PaymentInternalController,
      PaymentReservationsController,
      PaymentWebhooksController,
    ],
  },
  PaymentConfiguration.ENCRYPTION_PASSWORD(),
)
export class PaymentModule {}
