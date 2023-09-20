import { TestValidator } from "@nestia/e2e";
import imp from "iamport-server-api";
import { IIamportVBankPayment } from "iamport-server-api/lib/structures/IIamportVBankPayment";

import { test_fake_vbank_payment } from "./test_fake_vbank_payment";

export async function test_fake_vbank_payment_cancel_without_refund(
    connector: imp.IamportConnector,
): Promise<void> {
    const payment: IIamportVBankPayment = await test_fake_vbank_payment(
        connector,
    );
    await TestValidator.error("cancel without refund info")(async () =>
        imp.functional.payments.cancel(await connector.get(), {
            imp_uid: payment.imp_uid,
            merchant_uid: payment.merchant_uid,
            amount: payment.amount,
            checksum: payment.amount,
            reason: "테스트 결제 취소",
            // refund_account: "1101234567890",
            // refund_holder: "홍길동",
            // refund_bank: "국민은행",
            // refund_tel: "01012345678",
        }),
    );
}
