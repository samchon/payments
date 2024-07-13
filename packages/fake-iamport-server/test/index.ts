import { DynamicExecutor } from "@nestia/e2e";
import chalk from "chalk";
import { IamportConnector } from "iamport-server-api";

import { FakeIamportBackend } from "../src/FakeIamportBackend";
import { FakeIamportConfiguration } from "../src/FakeIamportConfiguration";
import { ErrorUtil } from "../src/utils/ErrorUtil";

async function handle_error(exp: any): Promise<void> {
  ErrorUtil.toJSON(exp);
}

async function main(): Promise<void> {
  // BACKEND SERVER
  const backend: FakeIamportBackend = new FakeIamportBackend();
  await backend.open();

  // PARAMETER
  const connector: IamportConnector = new IamportConnector(
    `http://127.0.0.1:${FakeIamportConfiguration.API_PORT}`,
    {
      imp_key: "test_imp_key",
      imp_secret: "test_imp_secret",
    },
  );
  global.process.on("uncaughtException", handle_error);
  global.process.on("unhandledRejection", handle_error);

  // DO TEST
  const report: DynamicExecutor.IReport = await DynamicExecutor.validate({
    prefix: "test",
    location: __dirname + "/features",
    parameters: () => [connector],
    onComplete: (exec) => {
      const trace = (str: string) =>
        console.log(`  - ${chalk.green(exec.name)}: ${str}`);
      if (exec.error === null) {
        const elapsed: number =
          new Date(exec.completed_at).getTime() -
          new Date(exec.started_at).getTime();
        trace(`${chalk.yellow(elapsed.toLocaleString())} ms`);
      } else trace(chalk.red(exec.error.name));
    },
  });

  // TERMINATE
  await backend.close();

  const exceptions: Error[] = report.executions
    .filter((exec) => exec.error !== null)
    .map((exec) => exec.error!);
  if (exceptions.length === 0) {
    console.log(`Total elapsed time: ${report.time.toLocaleString()} ms`);
    console.log("Success");
  } else {
    for (const exp of exceptions) console.log(exp);
    process.exit(-1);
  }
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
