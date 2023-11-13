import btoa from "btoa";
import fake from "fake-toss-payments-server";
import toss from "toss-payments-server-api";

import { PaymentConfiguration } from "../../PaymentConfiguration";
import { PaymentGlobal } from "../../PaymentGlobal";

export namespace TossAsset {
  export async function connection(storeId: string): Promise<toss.IConnection> {
    const host: string =
      PaymentGlobal.testing === true
        ? `http://127.0.0.1:${fake.FakeTossConfiguration.API_PORT}`
        : "https://api.tosspayments.com";
    const token: string = btoa(
      PaymentConfiguration.TOSS_SECRET_KEY(storeId) + ":",
    );

    return {
      host,
      headers: {
        Authorization: `Basic ${token}`,
      },
    };
  }
}
