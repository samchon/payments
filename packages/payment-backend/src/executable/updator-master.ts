import { PaymentUpdator } from "../PaymentUpdator";

async function main(): Promise<void> {
    await PaymentUpdator.master();
    await PaymentUpdator.slave("127.0.0.1");
}
main().catch((exp) => {
    console.log(exp);
    process.exit(-1);
});
