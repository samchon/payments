import type { INestiaConfig } from "@nestia/sdk";

const NESTIA_CONFIG: INestiaConfig = {
    input: "src/controllers",
    output: "src/api",
    swagger: {
        output: "dist/swagger.json",
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
