import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import "@nestia/fetcher/lib/PlainFetcher";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { IEntity } from "@samchon/payment-api/lib/structures/common/IEntity";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";
import { IPaymentWebhookHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentWebhookHistory";
import { HttpError } from "iamport-server-api";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { v4 } from "uuid";

import { PaymentGlobal } from "../../PaymentGlobal";
import { IamportPaymentService } from "../../services/iamport/IamportPaymentService";
import { TossPaymentService } from "../../services/toss/TossPaymentService";
import { BcryptUtil } from "../../utils/BcryptUtil";
import { PaymentCancelHistoryProvider } from "./PaymentCancelHistoryProvider";

export namespace PaymentHistoryProvider {
  export namespace json {
    export const transform = (
      history: Prisma.payment_historiesGetPayload<ReturnType<typeof select>>,
    ): IPaymentHistory => ({
      id: history.id,
      vendor_code: history.vendor_code as "iamport",
      vendor: {
        code: history.vendor_code as "iamport",
        uid: history.vendor_uid,
        store_id: history.vendor_store_id,
      },
      source: {
        schema: history.source_schema,
        table: history.source_table,
        id: history.source_id,
      },
      cancels: history.cancels
        .map(PaymentCancelHistoryProvider.json.transform)
        .sort((a, b) => a.time.getTime() - b.time.getTime()),
      currency: history.currency,
      price: history.price,
      refund: history.refund !== 0 ? history.refund : null,
      data: JSON.parse(decrypt(history.data)),
      webhook_url: history.webhook_url ?? null,
      created_at: history.created_at.toString(),
      paid_at: history.paid_at !== null ? history.paid_at.toString() : null,
      cancelled_at:
        history.cancelled_at !== null ? history.cancelled_at.toString() : null,
    });

    export const select = () =>
      Prisma.validator<
        | Prisma.payment_historiesFindFirstArgs
        | Prisma.payment_historiesFindManyArgs
      >()({
        include: {
          cancels: PaymentCancelHistoryProvider.json.select(),
        },
      });
  }

  export const find =
    (where: Prisma.payment_historiesWhereInput) =>
    async (password: string): Promise<IPaymentHistory> => {
      const history =
        await PaymentGlobal.prisma.payment_histories.findFirstOrThrow({
          where,
          ...json.select(),
        });
      if (
        !(await BcryptUtil.equals({
          input: password,
          hashed: history.password,
        }))
      )
        throw new ForbiddenException("Wrong password.");
      return json.transform(history);
    };

  /* -----------------------------------------------------------
        WEBHOOK
    ----------------------------------------------------------- */
  export async function webhook(
    history: Prisma.payment_historiesGetPayload<{}> | IPaymentHistory,
    input: IPaymentWebhookHistory,
  ): Promise<void> {
    if (history.webhook_url === null)
      throw new Error(
        "Error on PaymentHistoryProvider.webhook(): no webhook_url.",
      );
    const response: Response = await fetch(history.webhook_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (response.status !== 200 && response.status !== 201)
      throw new HttpError(
        "POST",
        history.webhook_url,
        response.status,
        {},
        await response.text(),
      );
  }

  /* -----------------------------------------------------------
        STORE
    ----------------------------------------------------------- */
  export async function store(
    input: IPaymentHistory.IStore,
  ): Promise<IPaymentHistory> {
    const props = await approve(input);
    const history = await PaymentGlobal.prisma.payment_histories.create({
      data: {
        id: v4(),
        // VENDOR
        vendor_code: input.vendor.code,
        vendor_store_id: input.vendor.store_id,
        vendor_uid: input.vendor.uid,
        // SOURCE
        source_schema: input.source.schema,
        source_table: input.source.table,
        source_id: input.source.id,
        password: await BcryptUtil.hash(input.password),
        // PAYMENT
        data: encrypt(JSON.stringify(props.data)),
        webhook_url: input.webhook_url,
        currency: props.currency,
        price: props.price,
        refund: props.refund,
        created_at: new Date(),
        paid_at: props.paid_at,
        cancelled_at: props.cancelled_at,
        // CANCELS
      },
      ...json.select(),
    });
    return json.transform(history);
  }

  export const update =
    (history: IEntity) =>
    async (input: IPaymentHistory.IProps): Promise<IPaymentHistory> => {
      // RE-CONSTRUCT CANCEL HISTORIES
      await PaymentGlobal.prisma.payment_history_cancels.createMany({
        data: input.cancels.map(PaymentCancelHistoryProvider.collect(history)),
        skipDuplicates: true,
      });

      // UPDATE HISTORY
      await PaymentGlobal.prisma.payment_histories.update({
        where: { id: history.id },
        data: {
          currency: input.currency,
          price: input.price,
          refund: input.refund,
          paid_at: input.paid_at,
          cancelled_at: input.cancelled_at,
          data: encrypt(JSON.stringify(input.data)),
        },
        ...json.select(),
      });
      const record =
        await PaymentGlobal.prisma.payment_histories.findFirstOrThrow({
          where: { id: history.id },
          ...json.select(),
        });
      return json.transform(record);
    };

  async function approve(
    input: IPaymentHistory.IStore,
  ): Promise<IPaymentHistory.IProps> {
    if (input.vendor.code === "iamport") {
      const data: IIamportPayment = await IamportPaymentService.approve(
        input.vendor.store_id,
        input.vendor.uid,
        input.source.id,
        input.price,
      );
      return IamportPaymentService.parse(data);
    } else if (input.vendor.code === "toss.payments") {
      const data: ITossPayment = await TossPaymentService.approve(
        input.vendor.store_id,
        input.vendor.uid,
        {
          orderId: input.source.id,
          amount: input.price,
        },
      );
      return TossPaymentService.parse(data);
    }
    throw new BadRequestException(`Unknown vendor.`);
  }
}

const encrypt = (value: string) => AesPkcs5.encrypt(value, KEY(), IV());
const decrypt = (value: string) => AesPkcs5.decrypt(value, KEY(), IV());
const KEY = () => PaymentGlobal.env.PAYMENT_HISTORY_ENCRYPTION_KEY ?? "";
const IV = () => PaymentGlobal.env.PAYMENT_HISTORY_ENCRYPTION_IV ?? "";
