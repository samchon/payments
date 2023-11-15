import cp from "child_process";

import { PaymentConfiguration } from "./PaymentConfiguration";
import { PaymentGlobal } from "./PaymentGlobal";

export namespace PaymentSetupWizard {
  export async function schema(): Promise<void> {
    if (PaymentGlobal.testing === false)
      throw new Error(
        "Erron on PaymentSetupWizard.schema(): unable to reset database in non-test mode.",
      );

    const execute = (type: string) => (argv: string) =>
      cp.execSync(
        `npx prisma migrate ${type} --schema=src/schema.prisma ${argv}`,
        {
          stdio: "ignore",
          cwd: PaymentConfiguration.ROOT,
        },
      );
    execute("reset")("--force");
    execute("dev")("--name init");

    await PaymentGlobal.prisma.$executeRawUnsafe(
      `GRANT SELECT ON ALL TABLES IN SCHEMA ${PaymentGlobal.env.PAYMENT_POSTGRES_SCHEMA} TO ${PaymentGlobal.env.PAYMENT_POSTGRES_USERNAME_READONLY}`,
    );
  }

  export async function seed(): Promise<void> {}
}
