import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { ForbiddenException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { IPaymentReservation } from "@samchon/payment-api/lib/structures/payments/IPaymentReservation";
import imp from "iamport-server-api";
import { IIamportSubscription } from "iamport-server-api/lib/structures/IIamportSubscription";
import toss from "toss-payments-server-api";
import { ITossBilling } from "toss-payments-server-api/lib/structures/ITossBilling";
import { v4 } from "uuid";

import { PaymentGlobal } from "../../PaymentGlobal";
import { IamportAsset } from "../../services/iamport/IamportAsset";
import { TossAsset } from "../../services/toss/TossAsset";
import { BcryptUtil } from "../../utils/BcryptUtil";

export namespace PaymentReservationProvider {
  export namespace json {
    export const transform = (
      reservation: Prisma.payment_reservationsGetPayload<
        ReturnType<typeof select>
      >,
    ): IPaymentReservation => ({
      id: reservation.id,
      vendor_code: reservation.vendor_code as "iamport",
      vendor: {
        code: reservation.vendor_code as "iamport",
        store_id: reservation.vendor_store_id,
        uid: reservation.vendor_uid,
      },
      source: {
        schema: reservation.source_schema,
        table: reservation.source_table,
        id: reservation.source_id,
      },
      title: reservation.title,
      data: JSON.parse(decrypt(reservation.data)),
      created_at: reservation.created_at.toString(),
    });

    export const select = () =>
      Prisma.validator<
        | Prisma.payment_reservationsFindFirstArgs
        | Prisma.payment_reservationsFindManyArgs
      >()({});
  }

  export const find =
    (where: Prisma.payment_reservationsWhereInput) =>
    async (password: string): Promise<IPaymentReservation> => {
      const reservation =
        await PaymentGlobal.prisma.payment_reservations.findFirstOrThrow({
          where,
          ...json.select(),
        });
      if (
        !(await BcryptUtil.equals({
          input: password,
          hashed: reservation.password,
        }))
      )
        throw new ForbiddenException("Wrong password.");
      return json.transform(reservation);
    };

  export async function create(
    input: IPaymentReservation.ICreate,
  ): Promise<IPaymentReservation> {
    const data =
      input.vendor.code === "toss.payments"
        ? await get_toss_billing(input)
        : await get_iamport_subscription(input);
    const record = await PaymentGlobal.prisma.payment_reservations.create({
      data: {
        id: v4(),
        vendor_code: input.vendor.code,
        vendor_store_id: input.vendor.store_id,
        vendor_uid: input.vendor.uid,
        source_schema: input.source.schema,
        source_table: input.source.table,
        source_id: input.source.id,
        password: await BcryptUtil.hash(input.password),
        title: input.title,
        data: encrypt(JSON.stringify(data)),
        created_at: new Date(),
      },
      ...json.select(),
    });
    return json.transform(record);
  }

  async function get_iamport_subscription(
    input: IPaymentReservation.ICreate,
  ): Promise<IIamportSubscription> {
    const { response } = await imp.functional.subscribe.customers.at(
      await IamportAsset.connection(input.vendor.store_id),
      input.vendor.uid,
    );
    return response;
  }

  async function get_toss_billing(
    input: IPaymentReservation.ICreate,
  ): Promise<ITossBilling> {
    return toss.functional.v1.billing.authorizations.at(
      await TossAsset.connection(input.vendor.store_id),
      input.vendor.uid,
      {
        customerKey: input.source.id,
      },
    );
  }
}

const encrypt = (value: string) => AesPkcs5.encrypt(value, KEY(), IV());
const decrypt = (value: string) => AesPkcs5.decrypt(value, KEY(), IV());
const KEY = () => PaymentGlobal.env.PAYMENT_RESERVATION_ENCRYPTION_KEY ?? "";
const IV = () => PaymentGlobal.env.PAYMENT_RESERVATION_ENCRYPTION_IV ?? "";
