import nest from "@modules/nestjs";
import core from "@nestia/core";
import { IPaymentReservation } from "payment-api/lib/structures/payments/IPaymentReservation";
import { IPaymentSource } from "payment-api/lib/structures/payments/IPaymentSource";
import { tags } from "typia";

import { PaymentReservationProvider } from "../../providers/payments/PaymentReservationProvider";

@nest.Controller("payments/reservations")
export class PaymentReservationsController {
    /**
     * 간편 결제 수단 조회하기.
     *
     * @param input 간편 결제 수단의 원천 정보 + 비밀번호
     * @returns 결제 내역
     */
    @core.EncryptedRoute.Patch("get")
    public async get(
        @core.EncryptedBody() input: IPaymentSource.IAccessor,
    ): Promise<IPaymentReservation> {
        return PaymentReservationProvider.find({
            source_schema: input.schema,
            source_table: input.table,
            source_id: input.id,
        })(input.password);
    }

    /**
     * 간편 결제 수단 조회하기.
     *
     * @param id Primary Key
     * @param input 비밀번호
     * @returns 간편 결제 수단 정보
     */
    @core.EncryptedRoute.Patch(":id")
    public async at(
        @core.TypedParam("id") id: string & tags.Format<"uuid">,
        @core.EncryptedBody() input: IPaymentSource.IPassword,
    ): Promise<IPaymentReservation> {
        return PaymentReservationProvider.find({ id })(input.password);
    }

    /**
     * 간편 결제 수단 등록하기.
     *
     * @param input 간편 결제 수단 입력 정보
     * @returns 간편 결제 수단 정보
     */
    @core.EncryptedRoute.Post()
    public async store(
        @core.EncryptedBody() input: IPaymentReservation.IStore,
    ): Promise<IPaymentReservation> {
        return PaymentReservationProvider.store(input);
    }
}
