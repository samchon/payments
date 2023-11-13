import { tags } from "typia";

import { IPaymentHistory } from "./IPaymentHistory";
import { IPaymentSource } from "./IPaymentSource";

/**
 * 웹훅 이벤터 데이터.
 *
 * @author Samchon
 */
export interface IPaymentWebhook {
  /**
   * Primary Key.
   */
  id: string & tags.Format<"uuid">;

  /**
   * 원천 레코드 정보.
   */
  source: IPaymentSource;

  /**
   * 웹훅 이벤트 수신 전 결제 내역 정보.
   *
   * PG 사로부터 웹훅 이벤트 데이터를 수신하기 전, 즉 이전 상태의 결제 내역 정보.
   */
  previous: IPaymentWebhook.IHistory;

  /**
   * 웹훅 이벤트 수신 후 결제 내역 정보.
   *
   * PG 사로부터 웹훅 이벤트 데이터를 수신하여, 새로이 바뀌게 된 결제 내역 정보.
   */
  current: IPaymentWebhook.IHistory;
}
export namespace IPaymentWebhook {
  /**
   * 결제 내역 정보.
   *
   * 본래의 결제 내역 {@link IPaymentHistory} 에서 중복되는 원천 레코드 정보
   * {@link IPaymentSource} 를 뺌.
   */
  export type IHistory = Omit<IPaymentHistory, "source">;
}
