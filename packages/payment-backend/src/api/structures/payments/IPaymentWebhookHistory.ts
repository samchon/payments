import { tags } from "typia";

import { IPaymentHistory } from "./IPaymentHistory";
import { IPaymentSource } from "./IPaymentSource";

/**
 * 웹훅 이벤트 레코드.
 *
 * `IPaymentHistoryWebhook` 는 PG 벤더사로부터의 이벤트를 기록하는 엔티티이다.
 *
 * 웹훅 이벤트는 고객이 가상계좌를 선택하고 사후에 지불을 완료했다던가, 이미 결제한
 * 금액을 환불하여 결제가 취소되었다던가 하는 등의 이유로 발생한다. 그리고 웹훅 이벤트
 * 레코드의 발생은 곧, 원천 결제 레코드에 해당하는 {@link IPaymentHistory.data} 의
 * 수정을 불러온다.
 *
 * 때문에 `IPaymentHistoryWebhook` 에는 {@link previous} 라 하여, 웹훅 이벤트가
 * 발생하기 전의 {@link PaymentHistory.data} 를 기록하는 속성이 존재한다. 만일 웹훅
 * 이벤트가 발생하여 변동된 데이터를 보고 싶다면, 현 웹훅 이벤트가 가장 최신인지 여부를
 * 따져, {@link IPaymentHistory.data} 를 조회하던가 아니면 그 다음 웹훅 레코드의
 * {@link previous} 를 조회하던가 하면 된다.
 *
 * @author Samchon
 */
export interface IPaymentWebhookHistory {
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
  previous: IPaymentWebhookHistory.IHistory;

  /**
   * 웹훅 이벤트 수신 후 결제 내역 정보.
   *
   * PG 사로부터 웹훅 이벤트 데이터를 수신하여, 새로이 바뀌게 된 결제 내역 정보.
   */
  current: IPaymentWebhookHistory.IHistory;
}
export namespace IPaymentWebhookHistory {
  /**
   * 결제 내역 정보.
   *
   * 본래의 결제 내역 {@link IPaymentHistory} 에서 중복되는 원천 레코드 정보
   * {@link IPaymentSource} 를 뺌.
   */
  export type IHistory = Omit<IPaymentHistory, "source">;
}
