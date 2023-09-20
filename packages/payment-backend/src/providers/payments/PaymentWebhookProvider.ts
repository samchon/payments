import "@nestia/fetcher";
import { AesPkcs5 } from "@nestia/fetcher/lib/AesPkcs5";
import { payment_histories, payment_history_webhooks } from "@prisma/client";
import { IPaymentHistory } from "payment-api/lib/structures/payments/IPaymentHistory";
import { IPaymentWebhookHistory } from "payment-api/lib/structures/payments/IPaymentWebhookHistory";
import { InvalidArgument } from "tstl/exception/InvalidArgument";
import { v4 } from "uuid";

import { PaymentConfiguration } from "../../PaymentConfiguration";
import { PaymentGlobal } from "../../PaymentGlobal";
import { PaymentHistoryProvider } from "./PaymentHistoryProvider";

export namespace PaymentWebhookProvider {
    export const process =
        (vendor: "iamport" | "toss.payments") =>
        <Input extends object, Data extends object>(config: {
            uid: (input: Input) => string | null;
            fetch: (history: payment_histories) => Promise<Data>;
            props: (data: Data) => IPaymentHistory.IProps;
        }) =>
        async (input: Input): Promise<void> => {
            // NEED NOT TO DO ANYIHTNG
            const vendor_uid: string | null = config.uid(input);
            if (vendor_uid === null) return;

            // GET PREVIOUS HISTORY
            const record =
                await PaymentGlobal.prisma.payment_histories.findFirstOrThrow({
                    where: {
                        vendor_code: vendor,
                        vendor_uid: vendor_uid,
                    },
                    ...PaymentHistoryProvider.json.select(),
                });
            const previous: IPaymentHistory =
                PaymentHistoryProvider.json.transform(record);
            if (previous.vendor.code !== vendor) {
                throw new InvalidArgument(
                    `Vendor of the payment is not "${vendor}" but "${record.vendor_code}""`,
                );
            }

            // UPDATE HISTORY
            const data: Data = await config.fetch(record);
            const props: IPaymentHistory.IProps = config.props(data);
            const current: IPaymentHistory =
                await PaymentHistoryProvider.update(previous)(props);

            // DO WEBHOOK
            const webhook: payment_history_webhooks =
                await PaymentGlobal.prisma.payment_history_webhooks.create({
                    data: {
                        id: v4(),
                        history: {
                            connect: {
                                id: current.id,
                            },
                        },
                        previous: JSON.stringify(previous),
                        current: JSON.stringify(current),
                        data: JSON.stringify(input),
                        created_at: new Date(),
                    },
                });
            const request: IPaymentWebhookHistory = {
                id: webhook.id,
                source: current.source,
                previous: previous,
                current: current,
            };
            send(current, webhook, request).catch(() => {});
        };

    async function send(
        history: IPaymentHistory,
        webhook: payment_history_webhooks,
        request: IPaymentWebhookHistory,
    ): Promise<void> {
        let status: number | null = null;
        let body: string | null = null;

        const encryption = PaymentConfiguration.ENCRYPTION_PASSWORD();
        try {
            const response: Response = await fetch(history.webhook_url!, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain",
                },
                body: AesPkcs5.encrypt(
                    JSON.stringify(request),
                    encryption.key,
                    encryption.iv,
                ),
            });
            status = response.status;
            body = await response.text();
        } catch {}

        await PaymentGlobal.prisma.payment_history_webhook_responses.create({
            data: {
                id: v4(),
                webhook: {
                    connect: {
                        id: webhook.id,
                    },
                },
                status: status,
                body: body,
                created_at: new Date(),
            },
        });
    }
}
