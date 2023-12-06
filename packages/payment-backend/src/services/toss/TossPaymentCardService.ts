import toss from "toss-payments-server-api";
import { ITossCardPayment } from "toss-payments-server-api/lib/structures/ITossCardPayment";

import { TossAsset } from "./TossAsset";

export namespace TossPaymentCardService {
  export async function create(
    mid: string,
    input: ITossCardPayment.ICreate,
  ): Promise<ITossCardPayment> {
    return toss.functional.v1.payments.key_in(
      await TossAsset.connection(mid),
      input,
    );
  }
}
