import { MutexConnector, RemoteMutex } from "mutex-server";
import { Promisive } from "tgrid/typings/Promisive";
import { UniqueLock } from "tstl/thread/UniqueLock";

import { PaymentConfiguration } from "../PaymentConfiguration";
import { PaymentGlobal } from "../PaymentGlobal";
import { PaymentUpdator } from "../PaymentUpdator";
import api from "../api";
import { ISystem } from "../api/structures/monitors/ISystem";

async function main(): Promise<void> {
  // CONFIGURE MODE
  if (process.argv[2])
    PaymentGlobal.setMode(
      process.argv[2].toUpperCase() as typeof PaymentGlobal.mode,
    );

  // CONNECT TO THE UPDATOR SERVER
  const connector: MutexConnector<string, null> = new MutexConnector(
    PaymentConfiguration.SYSTEM_PASSWORD(),
    null,
  );
  await connector.connect(
    `ws://${PaymentConfiguration.MASTER_IP()}:${PaymentConfiguration.UPDATOR_PORT()}/update`,
  );

  // REQUEST UPDATE WITH MONOPOLYING A GLOBAL MUTEX
  const mutex: RemoteMutex = await connector.getMutex("update");
  const success: boolean = await UniqueLock.try_lock(mutex, async () => {
    const updator: Promisive<PaymentUpdator.IController> =
      connector.getDriver();
    await updator.update();
  });
  await connector.close();

  // SUCCESS OR NOT
  if (success === false) {
    console.log("Already on updating.");
    process.exit(-1);
  }

  // PRINT THE COMMIT STATUS
  const connection: api.IConnection = {
    host: `http://${PaymentConfiguration.MASTER_IP()}:${PaymentConfiguration.API_PORT()}`,
    encryption: PaymentConfiguration.ENCRYPTION_PASSWORD(),
  };
  const system: ISystem = await api.functional.monitors.system.get(connection);
  console.log("branch", system.arguments[2], system.commit.branch);
  console.log("hash", system.commit.hash);
  console.log("commit-time", system.commit.commited_at);
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
