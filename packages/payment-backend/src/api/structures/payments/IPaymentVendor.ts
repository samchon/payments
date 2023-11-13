/**
 * 벤더사 정보.
 *
 * `IPaymentVendor` 결제 PG 벤더사에 관련된 정보를 형상화한 자료구조 인터페이스이다.
 *
 * @author Samchon
 */
export interface IPaymentVendor<Code extends IPaymentVendor.Code> {
  /**
   * 벤더사 식별자 코드.
   *
   * 아임포트의 경우에는 `iamport` 를, 토스의 경우에는 `toss.payments` 를 적어주면 된다.
   */
  code: Code;

  /**
   * 벤더사에 등록한 스토어 ID.
   *
   * 결제 PG 사들은 서비스 주소가 다르거나, 또는 동일한 서비스이되 연결되는 백엔드 서버
   * 주소가 다르거든, 각기 다른 스토어 계정을 신청해 사용하라고 한다. 이는 요즘같이 MSA
   * (Micro Service Architecture) 가 대세인 시대에 매우 불합리한 방식이기는 하지만, 어쨋든
   * 이러한 이유로 인하여, 한 회사 내지 단체가 복수의 스토어 ID 를 가지는 경우가 왕왕
   * 있다.
   *
   * 때문에 `payments-server` 는, {@link IPaymentHistory 결제 내역}을 발행하거나
   * {@link IPaymentReservation 간편 결제 수단}을 등록할 때 모두, 사용된 스토어의 ID
   * 를 반드시 기재하도록 하고 있다.
   */
  store_id: string;

  /**
   * 벤더사로부터 발급받은 식별자 번호.
   *
   * 결제 PG 사들이 제공하는 팝업창을 이용하여 결제를 진행하거나 혹은 간편 결제 수단을
   * 등록하거든, 결제 PG 사들은 해당 건에 대하여 별도의 식별자 번호를 발급한다.
   * `IPaymentVendor.uid` 는 이처럼 결제 PG 사들이 발급해 준 식별자 번호를 기재하는
   * 속성이다.
   *
   * 단 예외가 하나 있어, 아임포트는 간편 결제 카드 등록 건에 대하여 별도의 식별자 번호를
   * 부여하지 않고, 귀하의 서비스에서 발급해 준 ID 를 그대로 사용한다. 때문에 아임포트를
   * 통한 간편 결제 카드 등록의 건만 예외적으로, `IPaymentVendor.uid` 에
   * {@link IPaymentSource.id} 를 동일하게 할당해주어야 한다.
   */
  uid: string;
}
export namespace IPaymentVendor {
  /**
   * 벤더사 식별자 코드 타입.
   */
  export type Code = "iamport" | "toss.payments";
}
