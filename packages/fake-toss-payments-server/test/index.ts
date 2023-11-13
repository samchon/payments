import { DynamicExecutor } from "@nestia/e2e";

import { FakeTossBackend } from "../src/FakeTossBackend";
import { FakeTossConfiguration } from "../src/FakeTossConfiguration";
import toss from "../src/api";

async function main(): Promise<void> {
  // BACKEND SERVER
  const backend: FakeTossBackend = new FakeTossBackend();
  await backend.open();

  // CONNECTION INFO
  const connection: toss.IConnection = {
    host: `http://127.0.0.1:${FakeTossConfiguration.API_PORT}`,
  };

  // DO TEST
  const report: DynamicExecutor.IReport = await DynamicExecutor.validate({
    extension: __filename.substr(-2),
    prefix: "test",
    parameters: () => [connection],
  })(__dirname + "/features");

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
