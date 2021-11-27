import { Backend } from "../Backend";

import toss from "../api";

import { Configuration } from "../Configuration";
import { DynamicImportIterator } from "./internal/DynamicImportIterator";

async function main(): Promise<void>
{
    // BACKEND SERVER
    const backend: Backend = new Backend();
    await backend.open(Configuration.API_PORT);

    // CONNECTION INFO
    const connection: toss.IConnection = {
        host: `http://127.0.0.1:${Configuration.API_PORT}`,
    };

    // DO TEST
    const exceptions: Error[] = await DynamicImportIterator.force
    (
        __dirname + "/features", 
        {
            prefix: "test", 
            parameters: [connection]
        }
    );

    // TERMINATE
    await backend.close();

    if (exceptions.length === 0)
        console.log("Success");
    else
    {
        for (const exp of exceptions)
            console.log(exp);
        process.exit(-1);
    }
}
main().catch(exp =>
{
    console.log(exp);
    process.exit(-1);
});