import PaymentAPI from "payment-api";
import { ISystem } from "payment-api/lib/structures/monitors/ISystem";
import typia from "typia";

export async function test_api_monitor_system(
    connection: PaymentAPI.IConnection,
): Promise<void> {
    const system: ISystem = await PaymentAPI.functional.monitors.system.get(
        connection,
    );
    typia.assert(system);
}
