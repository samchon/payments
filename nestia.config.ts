import type { INestiaConfig } from "@nestia/sdk";

const NESTIA_CONFIG: INestiaConfig = {
    input: "src/controllers",
    output: "src/api",
    simulate: true,
    swagger: {
        output: "dist/swagger.json",
        info: {
            title: "Toss Payments API",
            description:
                "Built by [fake-toss-payments-server](https://github.com/samchon/fake-toss-payments-server) with [nestia](https://github.com/samchon/nestia)",
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
