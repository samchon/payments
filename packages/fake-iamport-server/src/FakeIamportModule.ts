import { Module } from "@nestjs/common";

import { FakeIamportCertificationsController } from "./controllers/FakeIamportCertificationsController";
import { FakeIamportInternalController } from "./controllers/FakeIamportInternalController";
import { FakeIamportPaymentsController } from "./controllers/FakeIamportPaymentsController";
import { FakeIamportReceiptsController } from "./controllers/FakeIamportReceiptsController";
import { FakeIamportUsersController } from "./controllers/FakeIamportUsersController";
import { FakeIamportVbanksController } from "./controllers/FakeIamportVbanksController";
import { FakeIamportSubscribeCustomersController } from "./controllers/subscribe/FakeIamportSubscribeCustomersController";
import { FakeIampotSubscribePaymentsController } from "./controllers/subscribe/FakeIamportSubscribePaymentsController";

@Module({
  controllers: [
    FakeIamportSubscribeCustomersController,
    FakeIampotSubscribePaymentsController,
    FakeIamportCertificationsController,
    FakeIamportInternalController,
    FakeIamportPaymentsController,
    FakeIamportReceiptsController,
    FakeIamportUsersController,
    FakeIamportVbanksController,
  ],
})
export class FakeIamportModule {}
