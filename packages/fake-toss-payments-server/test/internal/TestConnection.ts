import btoa from "btoa";

import { FakeTossConfiguration } from "../../src/FakeTossConfiguration";
import toss from "../../src/api";

export namespace TestConnection {
  export const FAKE: toss.IConnection = {
    host: `http://127.0.0.1:${FakeTossConfiguration.API_PORT}`,
    headers: {
      Authorization: `Basic ${btoa("test_ak_ZORzdMaqN3wQd5k6ygr5AkYXQGwy:")}`,
    },
  };

  export const REAL: toss.IConnection = {
    host: `https://api.tosspayments.com`,
    headers: {
      Authorization: `Basic ${btoa("test_ak_ZORzdMaqN3wQd5k6ygr5AkYXQGwy:")}`,
    },
  };
}
