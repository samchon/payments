import { DynamicModule } from "@nestia/core";

export const FakeIamportModule = () =>
    DynamicModule.mount(__dirname + "/controllers");
