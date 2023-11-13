import { Module } from "@nestjs/common";

import { FakeTossBillingController } from "./controllers/FakeTossBillingController";
import { FakeTossCashReceiptsController } from "./controllers/FakeTossCashReceiptsController";
import { FakeTossInternalController } from "./controllers/FakeTossInternalController";
import { FakeTossPaymentsController } from "./controllers/FakeTossPaymentsController";
import { FakeTossVirtualAccountsController } from "./controllers/FakeTossVirtualAccountsController";

@Module({
  controllers: [
    FakeTossBillingController,
    FakeTossCashReceiptsController,
    FakeTossInternalController,
    FakeTossPaymentsController,
    FakeTossVirtualAccountsController,
  ],
})
export class FakeTossModule {}
