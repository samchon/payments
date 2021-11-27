import { v4 } from "uuid";

import toss from "../../../api";
import { ITossCardPayment } from "../../../api/structures/ITossCardPayment";

import { TestConnection } from "../../internal/TestConnection";
import { exception_must_be_thrown } from "../../internal/exception_must_be_thrown";

export async function test_virtual_payment_approval(): Promise<void>
{
    // GENERATE A RANDOM PAYMENT
    const payment: ITossCardPayment = await toss.functional.payments.key_in
    (
        TestConnection.LOCAL,
        {
            // CARD INFORMATION
            method: "card",
            cardNumber: "1111222233334444",
            cardExpirationYear: "24",
            cardExpirationMonth: "03",

            // ORDER INFORMATION
            orderId: v4(),
            amount: 1000,

            // FAKE PROPERTY
            __approved: false
        }
    );

    //----
    // APPROVAL
    //----
    // WRONG ORDER-ID
    await exception_must_be_thrown
    (
        "VirtualTossPaymentsController.approve() with wrong orderId",
        () => toss.functional.payments.approve
        (
            TestConnection.LOCAL,
            payment.paymentKey,
            {
                orderId: "wrong-order-id",
                amount: payment.totalAmount
            }
        )
    );
    
    // WRONG APPROVAL
    await exception_must_be_thrown
    (
        "VirtualTossPaymentsController.approve() with wrong amount",
        () => toss.functional.payments.approve
        (
            TestConnection.LOCAL,
            payment.paymentKey,
            {
                orderId: payment.orderId,
                amount: payment.totalAmount - 100
            }
        )
    );
    
    // EXACT APPROVAL
    await toss.functional.payments.approve
    (
        TestConnection.LOCAL,
        payment.paymentKey,
        {
            orderId: payment.orderId,
            amount: payment.totalAmount
        } 
    );

    // POSSIBLE TO ACCESS
    await toss.functional.payments.at(TestConnection.LOCAL, payment.paymentKey);
}