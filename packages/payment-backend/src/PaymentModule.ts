import core from "@nestia/core";

import { PaymentConfiguration } from "./PaymentConfiguration";

export const PaymentModule = () =>
    core.EncryptedModule.dynamic(
        __dirname + "/controllers",
        PaymentConfiguration.ENCRYPTION_PASSWORD(),
    );
