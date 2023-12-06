import core from "@nestia/core";
import { Controller, UnprocessableEntityException } from "@nestjs/common";
import { IIamportPayment } from "iamport-server-api/lib/structures/IIamportPayment";
import { IIamportReceipt } from "iamport-server-api/lib/structures/IIamportReceipt";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import { IIamportUser } from "iamport-server-api/lib/structures/IIamportUser";
import { v4 } from "uuid";

import { FakeIamportUserAuth } from "../decorators/FakeIamportUserAuth";
import { FakeIamportResponseProvider } from "../providers/FakeIamportResponseProvider";
import { FakeIamportStorage } from "../providers/FakeIamportStorage";

@Controller("receipts/:imp_uid")
export class FakeIamportReceiptsController {
  /**
   * 현금 영수증 조회하기.
   *
   * @param imp_uid 귀속 결제의 {@link IIamportPayment.imp_uid}
   * @returns 현금 영수증 정보
   *
   * @security bearer
   * @author Samchon
   */
  @core.TypedRoute.Get()
  public at(
    @FakeIamportUserAuth() _user: IIamportUser.IAccessor,
    @core.TypedParam("imp_uid") imp_uid: string,
  ): IIamportResponse<IIamportReceipt> {
    const receipt: IIamportReceipt = FakeIamportStorage.receipts.get(imp_uid);
    return FakeIamportResponseProvider.success(receipt);
  }

  /**
   * 현금 영수증 발행하기.
   *
   * @param imp_uid 귀속 결제의 {@link IIamportPayment.imp_uid}
   * @param input 현금 영수증 입력 정보
   * @returns 현금 영수증 정보
   *
   * @security bearer
   * @author Samchon
   */
  @core.TypedRoute.Post()
  public create(
    @FakeIamportUserAuth() _user: IIamportUser.IAccessor,
    @core.TypedParam("imp_uid") imp_uid: string,
    @core.TypedBody() input: IIamportReceipt.ICreate,
  ): IIamportResponse<IIamportReceipt> {
    const payment: IIamportPayment = FakeIamportStorage.payments.get(imp_uid);
    if (!payment.paid_at)
      throw new UnprocessableEntityException("Not paid yet.");
    else if (FakeIamportStorage.receipts.has(imp_uid) === true) {
      const oldbie: IIamportReceipt = FakeIamportStorage.receipts.get(imp_uid);
      if (oldbie.cancelled_at === null)
        throw new UnprocessableEntityException("Already issued.");
    }

    const receipt: IIamportReceipt = {
      imp_uid,
      receipt_uid: v4(),
      apply_num: v4(),
      type: input.type || "person",
      amount: payment.amount,
      vat: payment.amount * 0.1,
      receipt_url: "https://github.com/samchon/fake-iamport-server",
      applied_at: Date.now() / 1000,
      cancelled_at: 0,
    };
    FakeIamportStorage.receipts.set(imp_uid, receipt);
    payment.cash_receipt_issue = true;

    return FakeIamportResponseProvider.success(receipt);
  }

  /**
   * 현금 영수증 취소하기.
   *
   * @param imp_uid 귀속 결제의 {@link IIamportPayment.imp_uid}
   * @returns 취소된 현금 영수증 정보
   *
   * @security bearer
   * @author Samchon
   */
  @core.TypedRoute.Delete()
  public erase(
    @FakeIamportUserAuth() _user: IIamportUser.IAccessor,
    @core.TypedParam("imp_uid") imp_uid: string,
  ) {
    const payment: IIamportPayment = FakeIamportStorage.payments.get(imp_uid);
    const receipt: IIamportReceipt = FakeIamportStorage.receipts.get(imp_uid);

    if (receipt.cancelled_at !== null)
      throw new UnprocessableEntityException("Already cancelled.");

    payment.cash_receipt_issue = false;
    receipt.cancelled_at = Date.now() / 1000;

    return FakeIamportResponseProvider.success(receipt);
  }
}
