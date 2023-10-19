import { DynamicModule } from "@nestia/core";

export const FakeTossModule = () =>
    DynamicModule.mount(`${__dirname}/controllers`);
