import { ITossCardPayment } from "../../../api/structures/ITossCardPayment";

export function test_structure_card_payment(): void
{
    const payment: ITossCardPayment = {
        "mId": "tvivarepublica",
        "version": "1.3",
        "transactionKey": "EB15F79E4969D7F39BF23EAA8ACA98D0",
        "paymentKey": "Ok2WNa0EMg4Gv6LjeKD8aE5voJ5kk8wYxAdXy19qpobJmB7P",
        "orderId": "0d1ac8fb-fe5b-4795-862e-b236adeec8b5",
        "orderName": "[100원] INLAY CHAIR",
        "method": "카드",
        "status": "DONE",
        "requestedAt": "2021-12-02T15:16:23+09:00",
        "approvedAt": "2021-12-02T15:17:06+09:00",
        "useEscrow": false,
        "cultureExpense": false,
        "card": {
            "company": "신한",
            "number": "422155******6150",
            "installmentPlanMonths": 0,
            "isInterestFree": false,
            "approveNo": "00000000",
            "useCardPoint": false,
            "cardType": "신용",
            "ownerType": "개인",
            "acquireStatus": "READY",
            "receiptUrl": "https://dashboard.tosspayments.com/sales-slip?transactionId=2KHk6Y9pTKHj96Q4hrRFrB21qoeFPGyV%2FmEF91l8qM%2F%2BRDu%2FjzhchLHyaNnfYBsm&ref=PX"
        },
        // "virtualAccount": null,
        // "transfer": null,
        // "mobilePhone": null,
        // "giftCertificate": null,
        "cashReceipt": null,
        "discount": null,
        "cancels": null,
        // "secret": "ps_5mBZ1gQ4YVX7AXDPN7x3l2KPoqNb",
        "type": "NORMAL",
        "easyPay": "토스결제",
        "currency": "KRW",
        "totalAmount": 100,
        "balanceAmount": 100,
        "suppliedAmount": 91,
        "vat": 9,
        "taxFreeAmount": 0
    };
    payment;
}