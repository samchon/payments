import type nestia from "@nestia/sdk";

const NESTIA_CONFIG: nestia.INestiaConfig = {
    simulate: true,
    input: "src/controllers",
    output: "src/api",
    distribute: "../payment-api",
    swagger: {
        output: "../payment-api/swagger.json",
    },
};
export default NESTIA_CONFIG;
