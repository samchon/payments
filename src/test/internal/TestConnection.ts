import btoa from "btoa";

import { TossFakeConfiguration } from "../../FakeTossConfiguration";
import toss from "../../api";

export namespace TestConnection {
    export const FAKE: toss.IConnection = {
        host: `http://127.0.0.1:${TossFakeConfiguration.API_PORT}`,
        headers: {
            Authorization: `Basic ${btoa(
                "test_ak_ZORzdMaqN3wQd5k6ygr5AkYXQGwy:",
            )}`,
        },
    };

    export const REAL: toss.IConnection = {
        host: `https://api.tosspayments.com`,
        headers: {
            Authorization: `Basic ${btoa(
                "test_ak_ZORzdMaqN3wQd5k6ygr5AkYXQGwy:",
            )}`,
        },
    };
}
