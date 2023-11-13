import PaymentAPI from "@samchon/payment-api";
import { ISystem } from "@samchon/payment-api/lib/structures/monitors/ISystem";
import typia from "typia";

export async function test_api_monitor_system(
  connection: PaymentAPI.IConnection,
): Promise<void> {
  const system: ISystem = await PaymentAPI.functional.monitors.system.get(
    connection,
  );
  typia.assert(system);
}
