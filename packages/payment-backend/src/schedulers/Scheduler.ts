import { DynamicExecutor } from "@nestia/e2e";
import { MutexConnector, RemoteMutex } from "mutex-server";
import { sleep_for } from "tstl/thread/global";

import { PaymentGlobal } from "../PaymentGlobal";

export namespace Scheduler {
    export async function repeat(): Promise<void> {
        const critical: MutexConnector<string, null> =
            await PaymentGlobal.critical.get();
        const mutex: RemoteMutex = await critical.getMutex("scheduler");

        if ((await mutex.try_lock()) === false) return;

        let time: number = 0;
        while (true) {
            const now: number = Date.now();
            const interval: number = now - time;
            time = now;

            await DynamicExecutor.assert({
                prefix: "schedule",
                parameters: () => [interval],
            })(__dirname + "/features");
            await sleep_for(INTERVAL);
        }
    }
}

const INTERVAL = 60_000;
