import type { INestiaConfig } from "@nestia/sdk";

const NESTIA_CONFIG: INestiaConfig = {
    simulate: true,
    input: "src/controllers",
    output: "src/api",
    distribute: "../toss-payments-server-api",
    swagger: {
        output: "../toss-payments-server-api/swagger.json",
        info: {
            title: "Toss Payments API",
            description:
                "Built by [fake-toss-payments-server](https://github.com/samchon/payments) with [nestia](https://github.com/samchon/nestia)",
        },
        servers: [
            {
                url: "http://localhost:30771",
                description: "fake",
            },
            {
                url: "https://api.tosspayments.com",
                description: "real",
            },
        ],
        security: {
            basic: {
                type: "apiKey",
                name: "Authorization",
                in: "header",
            },
        },
    },
};
export default NESTIA_CONFIG;