import fake from "fake-iamport-server";
import imp from "iamport-server-api";
import { VariadicSingleton } from "tstl";

import { PaymentConfiguration } from "../../PaymentConfiguration";
import { PaymentGlobal } from "../../PaymentGlobal";

export namespace IamportAsset {
  export async function connection(storeId: string): Promise<imp.IConnection> {
    const connector: imp.IamportConnector = await singleton.get(
      PaymentGlobal.mode,
      PaymentGlobal.testing,
      storeId,
    );
    return await connector.get();
  }

  const singleton: VariadicSingleton<
    Promise<imp.IamportConnector>,
    [typeof PaymentGlobal.mode, boolean, string]
  > = new VariadicSingleton(async (_mode, testing, storeId) => {
    if (testing === true)
      return new imp.IamportConnector(
        `http://127.0.0.1:${fake.FakeIamportConfiguration.API_PORT}`,
        {
          imp_key: "test_imp_key",
          imp_secret: "test_imp_secret",
        },
      );
    else
      return new imp.IamportConnector(
        "https://api.iamport.kr",
        PaymentConfiguration.IAMPORT_USER_ACCESSOR(storeId),
      );
  });
}
