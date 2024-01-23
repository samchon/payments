import { DynamicExecutor } from "@nestia/e2e";
import api from "@samchon/payment-api/lib/index";
import fs from "fs";
import { Singleton, randint } from "tstl";
import { sleep_for } from "tstl/thread/global";

import { PaymentBackend, PaymentConfiguration, PaymentGlobal } from "../src";
import { ErrorUtil } from "../src/utils/ErrorUtil";

function cipher(val: number): string {
  if (val < 10) return "0" + val;
  else return String(val);
}

async function handle_error(exp: any): Promise<void> {
  try {
    const date: Date = new Date();
    const fileName: string = `${date.getFullYear()}${cipher(
      date.getMonth() + 1,
    )}${cipher(date.getDate())}${cipher(date.getHours())}${cipher(
      date.getMinutes(),
    )}${cipher(date.getSeconds())}.${randint(0, Number.MAX_SAFE_INTEGER)}`;
    const content: string = JSON.stringify(ErrorUtil.toJSON(exp), null, 4);

    await directory.get();
    await fs.promises.writeFile(
      `${__dirname}/../../assets/logs/errors/${fileName}.log`,
      content,
      "utf8",
    );
  } catch {}
}

async function main(): Promise<void> {
  // UNEXPECTED ERRORS
  global.process.on("uncaughtException", handle_error);
  global.process.on("unhandledRejection", handle_error);

  // OPEN SERVER
  PaymentGlobal.testing = true;
  const backend: PaymentBackend = new PaymentBackend();
  await backend.open();

  // DO TEST
  const connection: api.IConnection = {
    host: `http://127.0.0.1:${PaymentConfiguration.API_PORT()}`,
    encryption: {
      key: PaymentConfiguration.ENCRYPTION_PASSWORD().key,
      iv: PaymentConfiguration.ENCRYPTION_PASSWORD().iv,
    },
  };
  const report: DynamicExecutor.IReport = await DynamicExecutor.validate({
    prefix: "test",
    parameters: () => [
      {
        host: connection.host,
        encryption: connection.encryption,
      },
    ],
  })(__dirname + "/features");

  // TERMINATE
  await sleep_for(2500); // WAIT FOR BACKGROUND EVENTS
  await backend.close();

  const exceptions: Error[] = report.executions
    .filter((exec) => exec.error !== null)
    .map((exec) => exec.error!);
  if (exceptions.length === 0) {
    console.log("Success");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
  } else {
    for (const exp of exceptions) console.log(exp);
    console.log("Failed");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
    process.exit(-1);
  }
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});

const directory = new Singleton(async () => {
  await mkdir(`${__dirname}/../../assets`);
  await mkdir(`${__dirname}/../../assets/logs`);
  await mkdir(`${__dirname}/../../assets/logs/errors`);
});

async function mkdir(path: string): Promise<void> {
  try {
    await fs.promises.mkdir(path);
  } catch {}
}
