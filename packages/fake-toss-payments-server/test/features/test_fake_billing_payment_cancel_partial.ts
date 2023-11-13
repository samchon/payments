import { validate_fake_payment_cancel_partial } from "./internal/validate_fake_payment_cancel_partial";
import { test_fake_billing_payment } from "./test_fake_billing_payment";

export const test_fake_billing_payment_cancel_partial =
  validate_fake_payment_cancel_partial(
    () => test_fake_billing_payment(),
    false,
  );
