import { PaymentUpdator } from "../PaymentUpdator";

async function main(): Promise<void> {
  await PaymentUpdator.slave();
}
main().catch((exp) => {
  console.error(exp);
  process.exit(-1);
});
