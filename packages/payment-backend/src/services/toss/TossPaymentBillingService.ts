import toss from "toss-payments-server-api";
import { ITossBilling } from "toss-payments-server-api/lib/structures/ITossBilling";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";

import { TossAsset } from "./TossAsset";

export namespace TossPaymentBillingService {
  export async function store(
    mid: string,
    input: ITossBilling.IStore,
  ): Promise<ITossBilling> {
    return toss.functional.v1.billing.authorizations.card.store(
      await TossAsset.connection(mid),
      input,
    );
  }

  export async function at(
    mid: string,
    input: ITossBilling.IAccessor,
  ): Promise<ITossBilling> {
    return toss.functional.v1.billing.authorizations.at(
      await TossAsset.connection(mid),
      input.authKey,
      input,
    );
  }

  export async function pay(
    mid: string,
    input: ITossBilling.IPaymentStore,
  ): Promise<ITossPayment> {
    return toss.functional.v1.billing.pay(
      await TossAsset.connection(mid),
      input.billingKey,
      input,
    );
  }
}
