import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import { IIamportSubscription } from "iamport-server-api/lib/structures/IIamportSubscription";
import { IIamportUser } from "iamport-server-api/lib/structures/IIamportUser";
import { v4 } from "uuid";

import { FakeIamportUserAuth } from "../../decorators/FakeIamportUserAuth";
import { FakeIamportResponseProvider } from "../../providers/FakeIamportResponseProvider";
import { FakeIamportStorage } from "../../providers/FakeIamportStorage";
import { AdvancedRandomGenerator } from "../../utils/AdvancedRandomGenerator";

@Controller("subscribe/customers")
export class FakeIamportSubscribeCustomersController {
  /**
   * 간편 결제 카드 정보 조회하기.
   *
   * `subscribe.customers.at` 은 고객이 {@link create} 나 혹은 아임포트가 제공하는
   * 간편 결제 카드 등록 창을 이용하여 저장한 간편 결제 카드 정보를 조회하는 API
   * 함수이다.
   *
   * @param customer_uid 고객 (간편 결제 카드) 식별자 키
   * @returns 간편 결제 카드 정보
   *
   * @security bearer
   * @author Samchon
   */
  @core.TypedRoute.Get(":customer_uid")
  public at(
    @FakeIamportUserAuth() _user: IIamportUser.IAccessor,
    @core.TypedParam("customer_uid") customer_uid: string,
  ): IIamportResponse<IIamportSubscription> {
    // GET SUBSCRIPTION RECORD
    const subscription = FakeIamportStorage.subscriptions.get(customer_uid);

    // RETURNS
    return FakeIamportResponseProvider.success(subscription);
  }

  /**
   * 간편 결제 카드 등록하기.
   *
   * `subscribe.customers.stoer` 는 고객이 자신의 카드를 서버에 등록해두고, 매번 결제가
   * 필요할 때마다 카드 정보를 반복 입력하는 일 없이, 간편하게 결제를 진행하고자 할 때
   * 사용하는 API 함수이다.
   *
   * 참고로 `subscribe.customers.create` 는 클라이언트 어플리케이션이 아임포트가 제공하는
   * 간편 결제 카드 등록 창을 사용하는 경우, 귀하의 백엔드 서버가 이를 실 서비스에서 호출하는
   * 일은 없을 것이다. 다만, 고객이 간편 결제 카드를 등록하는 상황을 시뮬레이션하기 위하여,
   * 테스트 자동화 프로그램 수준에서 사용될 수는 있다.
   *
   * @param customer_uid 고객 (간편 결제 카드) 식별자 키
   * @param input 카드 입력 정보
   * @returns 간편 결제 카드 정보
   *
   * @security bearer
   * @author Samchon
   */
  @core.TypedRoute.Post(":customer_uid")
  public create(
    @FakeIamportUserAuth() _user: IIamportUser.IAccessor,
    @core.TypedParam("customer_uid") customer_uid: string,
    @core.TypedBody() input: IIamportSubscription.ICreate,
  ): IIamportResponse<IIamportSubscription> {
    // ENROLLMENT
    const subscription: IIamportSubscription = {
      customer_uid,
      pg_provider: "pg-of-somewhere",
      pg_id: v4(),
      card_type: "card",
      card_code: v4(),
      card_name: AdvancedRandomGenerator.name(),
      card_number: input.card_number,
      customer_name: AdvancedRandomGenerator.name(),
      customer_tel: AdvancedRandomGenerator.mobile(),
      customer_addr: "address-of-somewhere",
      customer_email: AdvancedRandomGenerator.alphabets(8) + "@samchon.org",
      customer_postcode: "11122",
      inserted: 1,
      updated: 0,
    };
    FakeIamportStorage.subscriptions.set(customer_uid, subscription);

    // RETURNS
    return FakeIamportResponseProvider.success(subscription);
  }

  /**
   * 간편 결제 카드 삭제하기.
   *
   * 간편 결제를 위하여 등록한 카드를 제거한다.
   *
   * @param customer_uid 고객 (간편 결제 카드) 식별자 키
   * @returns 삭제된 간편 결제 카드 정보
   *
   * @security bearer
   * @author Samchon
   */
  @core.TypedRoute.Delete(":customer_uid")
  public erase(
    @FakeIamportUserAuth() _user: IIamportUser.IAccessor,
    @core.TypedParam("customer_uid") customer_uid: string,
  ): IIamportResponse<IIamportSubscription> {
    // ERASE RECORD
    const subscription = FakeIamportStorage.subscriptions.get(customer_uid);
    FakeIamportStorage.subscriptions.erase(customer_uid);

    // RETURNS
    return FakeIamportResponseProvider.success(subscription);
  }
}
