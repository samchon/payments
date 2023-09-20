import { PaymentConfiguration } from "../PaymentConfiguration";
import { PaymentGlobal } from "../PaymentGlobal";
import PaymentAPI from "../api";
import { IPerformance } from "../api/structures/monitors/IPerformance";
import { ISystem } from "../api/structures/monitors/ISystem";

async function main(): Promise<void> {
    // CONFIGURE MODE
    if (process.argv[2]) PaymentGlobal.setMode(process.argv[2] as "local");

    // GET PERFORMANCE & SYSTEM INFO
    const connection: PaymentAPI.IConnection = {
        host: `http${
            PaymentGlobal.mode === "local" ? "" : "s"
        }://${PaymentConfiguration.MASTER_IP()}:${PaymentConfiguration.API_PORT()}`,
        encryption: PaymentConfiguration.ENCRYPTION_PASSWORD(),
    };
    const performance: IPerformance =
        await PaymentAPI.functional.monitors.performance.get(connection);
    const system: ISystem = await PaymentAPI.functional.monitors.system.get(
        connection,
    );

    // TRACE THEM
    console.log({ performance, system });
}
main().catch((exp) => {
    console.log(exp);
    process.exit(-1);
});
