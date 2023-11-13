import { validate_fake_payment_cancel } from "./internal/validate_fake_payment_cancel";
import { test_fake_card_payment } from "./test_fake_card_payment";

export const test_fake_card_payment_cancel = validate_fake_payment_cancel(
  () => test_fake_card_payment(),
  false,
);
