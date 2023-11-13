import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";
import imp from "iamport-server-api";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportPaymentCancel } from "iamport-server-api/lib/structures/IIamportPaymentCancel";
import { DomainError } from "tstl/exception/DomainError";

import { ErrorUtil } from "../../utils/ErrorUtil";
import { IamportAsset } from "./IamportAsset";

export namespace IamportPaymentService {
  export async function at(
    storeId: string,
    imp_uid: string,
  ): Promise<IIamportPayment> {
    const output = await imp.functional.payments.at(
      await IamportAsset.connection(storeId),
      imp_uid,
      {},
    );
    return output.response;
  }

  export async function approve(
    storeId: string,
    imp_uid: string,
    merchant_uid: string,
    amount: number,
  ): Promise<IIamportPayment> {
    const payment: IIamportPayment = await IamportPaymentService.at(
      storeId,
      imp_uid,
    );
    if (amount !== payment.amount) {
      await ErrorUtil.log("IamportPaymentService.approve()", {
        ...payment,
        storeId,
        imp_uid,
        amount,
      });
      await cancel(storeId, {
        imp_uid,
        reason: "잘못된 금액을 결제함",
        merchant_uid,
        checksum: null,
        amount,
      });
      throw new DomainError(
        `IamportPaymentService.approve(): wrong paid amount. It must be not ${amount} but ${payment.amount}.`,
      );
    }
    return payment;
  }

  export function parse(data: IIamportPayment): IPaymentHistory.IProps {
    return {
      currency: data.currency,
      price: data.amount,
      refund: data.cancel_amount,
      paid_at: data.paid_at ? new Date(data.paid_at * 1000) : null,
      cancelled_at: data.status === "cancelled" ? new Date() : null,
      cancels: data.cancel_history.map((cancel) => ({
        data: cancel,
        created_at: new Date(cancel.cancelled_at * 1000),
        price: cancel.amount,
        reason: cancel.reason,
      })),
      data,
    };
  }

  export async function cancel(
    storeId: string,
    input: IIamportPaymentCancel.IStore,
  ): Promise<IIamportPayment> {
    const reply = await imp.functional.payments.cancel(
      await IamportAsset.connection(storeId),
      input,
    );
    if (reply.code !== 0) throw new DomainError(reply.message);
    return reply.response;
  }
}
