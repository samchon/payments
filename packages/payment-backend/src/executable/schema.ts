import { PrismaClient } from "@prisma/client";

import { PaymentGlobal } from "../PaymentGlobal";

async function execute(
    database: string,
    username: string,
    password: string,
    script: string,
): Promise<void> {
    try {
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: `postgresql://${username}:${password}@${PaymentGlobal.env.POSTGRES_HOST}:${PaymentGlobal.env.POSTGRES_PORT}/${database}`,
                },
            },
        });
        const queries: string[] = script
            .split("\n")
            .map((str) => str.trim())
            .filter((str) => !!str);
        for (const query of queries)
            try {
                await prisma.$queryRawUnsafe(query);
            } catch (e) {
                await prisma.$disconnect();
            }
        await prisma.$disconnect();
    } catch (err) {
        console.log(err);
    }
}

async function main(): Promise<void> {
    const config = {
        database: PaymentGlobal.env.POSTGRES_DATABASE,
        schema: PaymentGlobal.env.POSTGRES_SCHEMA,
        username: PaymentGlobal.env.POSTGRES_USERNAME,
        readonlyUsername: PaymentGlobal.env.POSTGRES_USERNAME_READONLY,
        password: PaymentGlobal.env.POSTGRES_PASSWORD,
    };
    const root = {
        account: process.argv[2] ?? "postgres",
        password: process.argv[3] ?? "root",
    };

    await execute(
        "postgres",
        root.account,
        root.password,
        `
        CREATE USER ${config.username} WITH ENCRYPTED PASSWORD '${config.password}';
        ALTER ROLE ${config.username} WITH CREATEDB
        CREATE DATABASE ${config.database} OWNER ${config.username};
    `,
    );

    await execute(
        config.database,
        root.account,
        root.password,
        `
        CREATE SCHEMA ${config.schema} AUTHORIZATION ${config.username};
    `,
    );

    await execute(
        config.database,
        root.account,
        root.password,
        `
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ${config.schema} TO ${config.username};

        CREATE USER ${config.readonlyUsername} WITH ENCRYPTED PASSWORD '${config.password}';
        GRANT USAGE ON SCHEMA ${config.schema} TO ${config.readonlyUsername};
        GRANT SELECT ON ALL TABLES IN SCHEMA ${config.schema} TO ${config.readonlyUsername};
    `,
    );
}
main().catch((exp) => {
    console.log(exp);
    process.exit(-1);
});
