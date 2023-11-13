import { tags } from "typia";

import { IIamportPayment } from "./IIamportPayment";

/**
 * 카드 결제 정보.
 *
 * @author Samchon
 */
export interface IIamportCardPayment
  extends IIamportPayment.IBase<"card" | "samsung"> {
  /**
   * 카드 식별자 코드.
   */
  card_code: string;

  /**
   * 카드 이름.
   */
  card_name: string;

  /**
   * 카드 번호.
   */
  card_number: string & tags.Pattern<"\\d{4}-\\d{4}-\\d{4}-\\d{4}">;

  /**
   * 할부 개월 수.
   */
  card_quota: number & tags.Type<"uint32">;

  /**
   * 카드사 승인번호.
   */
  apply_num: string;
}
