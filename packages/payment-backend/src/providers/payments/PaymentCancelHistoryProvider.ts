import nest from "@modules/nestjs";
import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { Prisma } from "@prisma/client";
import { IEntity } from "@samchon/payment-api/lib/structures/common/IEntity";
import { IPaymentCancelHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentCancelHistory";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { ITossPayment } from "toss-payments-server-api/lib/structures/ITossPayment";
import { v4 } from "uuid";

import { PaymentGlobal } from "../../PaymentGlobal";
import { IamportPaymentService } from "../../services/iamport/IamportPaymentService";
import { TossPaymentService } from "../../services/toss/TossPaymentService";
import { PaymentHistoryProvider } from "./PaymentHistoryProvider";

export namespace PaymentCancelHistoryProvider {
    export namespace json {
        export const transform = (
            input: Prisma.payment_history_cancelsGetPayload<
                ReturnType<typeof select>
            >,
        ): IPaymentCancelHistory & { time: Date } => ({
            price: input.amount,
            reason: input.reason,
            created_at: input.created_at.toISOString(),
            time: input.created_at,
        });
        export const select = () =>
            Prisma.validator<
                | Prisma.payment_history_cancelsFindFirstArgs
                | Prisma.payment_history_cancelsFindManyArgs
            >()({});
    }

    export const store = async (
        input: IPaymentCancelHistory.IStore,
    ): Promise<IPaymentHistory> => {
        const history: IPaymentHistory = await PaymentHistoryProvider.find({
            source_schema: input.source.schema,
            source_table: input.source.table,
            source_id: input.source.id,
        })(input.password);
        const props: IPaymentHistory.IProps = await request(history)(input);
        return PaymentHistoryProvider.update(history)(props);
    };

    export const collect =
        (history: IEntity) =>
        (
            input: IPaymentCancelHistory.IProps,
        ): Prisma.payment_history_cancelsCreateManyInput => ({
            id: v4(),
            payment_history_id: history.id,
            amount: input.price,
            reason: input.reason,
            data: encrypt(JSON.stringify(input.data)),
            created_at: input.created_at,
        });

    const request =
        (history: IPaymentHistory) =>
        async (
            input: IPaymentCancelHistory.IStore,
        ): Promise<IPaymentHistory.IProps> => {
            if (history.vendor_code === "iamport") {
                const payment: IIamportPayment =
                    await IamportPaymentService.cancel(
                        history.vendor.store_id,
                        {
                            imp_uid: history.vendor.uid,
                            merchant_uid: history.source.id,
                            amount: input.price,
                            reason: input.reason,
                            checksum: null,
                            refund_bank: input.account?.bank,
                            refund_account: input.account?.account,
                            refund_holder: input.account?.holder,
                            refund_tel: input.account?.mobile,
                        },
                    );
                return IamportPaymentService.parse(payment);
            } else if (history.vendor_code === "toss.payments") {
                const payment: ITossPayment = await TossPaymentService.cancel(
                    history.vendor.store_id,
                    {
                        paymentKey: history.vendor.uid,
                        cancelReason: input.reason,
                        cancelAmount: input.price,
                        refundReceiveAccount: input.account
                            ? {
                                  bank: input.account.bank,
                                  accountNumber: input.account.account,
                                  holderName: input.account.holder,
                              }
                            : undefined,
                    },
                );
                return TossPaymentService.parse(payment);
            }
            throw new nest.BadRequestException(`Unknown vendor.`);
        };
}

const encrypt = (value: string) => AesPkcs5.encrypt(value, KEY(), IV());
// const decrypt = (value: string) => AesPkcs5.decrypt(value, KEY(), IV());
const KEY = () => PaymentGlobal.env.PAYMENT_CANCEL_HISTORY_ENCRYPTION_KEY ?? "";
const IV = () => PaymentGlobal.env.PAYMENT_CANCEL_HISTORY_ENCRYPTION_IV ?? "";
