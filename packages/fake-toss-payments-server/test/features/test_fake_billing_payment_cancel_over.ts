import { validate_fake_payment_cancel_over } from "./internal/validate_fake_payment_cancel_over";
import { test_fake_billing_payment } from "./test_fake_billing_payment";

export const test_fake_billing_payment_cancel_over =
  validate_fake_payment_cancel_over(() => test_fake_billing_payment(), false);
