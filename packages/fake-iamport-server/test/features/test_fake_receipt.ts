import { TestValidator } from "@nestia/e2e";
import imp from "iamport-server-api";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportReceipt } from "iamport-server-api/lib/structures/IIamportReceipt";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import typia from "typia";

import { test_fake_card_payment } from "./test_fake_card_payment";

export async function test_fake_receipt(
    connector: imp.IamportConnector,
): Promise<void> {
    const payment: IIamportPayment = await test_fake_card_payment(connector);
    const output: IIamportResponse<IIamportReceipt> =
        await imp.functional.receipts.store(
            await connector.get(),
            payment.imp_uid,
            {
                imp_uid: payment.imp_uid,
                identifier: "8803111******",
                identifier_type: "person",
                buyer_name: "남정호",
                buyer_tel: "010********",
            },
        );
    typia.assert(output);
    TestValidator.equals("imp_uid")(output.response.imp_uid)(payment.imp_uid);
    TestValidator.equals("amount")(output.response.amount)(payment.amount);

    const reloaded: IIamportResponse<IIamportPayment> =
        await imp.functional.payments.at(
            await connector.get(),
            payment.imp_uid,
            {},
        );
    typia.assert(reloaded);
    TestValidator.equals("issue")(reloaded.response.cash_receipt_issue)(true);
}
