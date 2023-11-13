import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { IPaymentCancelHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentCancelHistory";
import { IPaymentHistory } from "@samchon/payment-api/lib/structures/payments/IPaymentHistory";
import { IPaymentSource } from "@samchon/payment-api/lib/structures/payments/IPaymentSource";
import { tags } from "typia";

import { PaymentCancelHistoryProvider } from "../../providers/payments/PaymentCancelHistoryProvider";
import { PaymentHistoryProvider } from "../../providers/payments/PaymentHistoryProvider";

@Controller("payments/histories")
export class PaymentHistoriesController {
  /**
   * 결제 내역 상세 조회하기.
   *
   * @param input 결제 내역의 원천 정보 + 비밀번호
   * @returns 결제 내역
   *
   * @author Samchon
   */
  @core.EncryptedRoute.Patch("get")
  public async get(
    @core.EncryptedBody() input: IPaymentSource.IAccessor,
  ): Promise<IPaymentHistory> {
    return PaymentHistoryProvider.find({
      source_schema: input.schema,
      source_table: input.table,
      source_id: input.id,
    })(input.password);
  }

  /**
   * 결제 내역 상세 조회하기.
   *
   * @param id Primary Key
   * @param input 결제 내역의 비밀번호
   * @returns 결제 내역
   *
   * @author Samchon
   */
  @core.EncryptedRoute.Patch(":id")
  public async at(
    @core.TypedParam("id") id: string & tags.Format<"uuid">,
    @core.EncryptedBody() input: IPaymentSource.IPassword,
  ): Promise<IPaymentHistory> {
    return PaymentHistoryProvider.find({ id })(input.password);
  }

  /**
   * 결제 내역 발행하기.
   *
   * @param input 결제 내역 입력 정보
   * @returns 결제 내역
   *
   * @author Samchon
   */
  @core.EncryptedRoute.Post()
  public async store(
    @core.EncryptedBody() input: IPaymentHistory.IStore,
  ): Promise<IPaymentHistory> {
    return PaymentHistoryProvider.store(input);
  }

  /**
   * 결제 취소하기.
   *
   * @param input 결제 취소 내역 입력 정보
   *
   * @author Samchon
   */
  @core.EncryptedRoute.Put("cancel")
  public async cancel(
    @core.EncryptedBody() input: IPaymentCancelHistory.IStore,
  ): Promise<IPaymentHistory> {
    return PaymentCancelHistoryProvider.store(input);
  }
}
