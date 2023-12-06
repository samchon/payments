import toss from "toss-payments-server-api";
import { ITossVirtualAccountPayment } from "toss-payments-server-api/lib/structures/ITossVirtualAccountPayment";

import { TossAsset } from "./TossAsset";

export namespace TossPaymentVirtualAccountService {
  export async function create(
    storeId: string,
    input: ITossVirtualAccountPayment.ICreate,
  ): Promise<ITossVirtualAccountPayment> {
    return toss.functional.v1.virtual_accounts.create(
      await TossAsset.connection(storeId),
      input,
    );
  }
}
