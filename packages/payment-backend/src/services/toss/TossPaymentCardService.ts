import toss from "toss-payments-server-api";
import { ITossCardPayment } from "toss-payments-server-api/lib/structures/ITossCardPayment";

import { TossAsset } from "./TossAsset";

export namespace TossPaymentCardService {
  export async function store(
    mid: string,
    input: ITossCardPayment.IStore,
  ): Promise<ITossCardPayment> {
    return toss.functional.v1.payments.key_in(
      await TossAsset.connection(mid),
      input,
    );
  }
}
