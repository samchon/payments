import { tags } from "typia";

/**
 * 원천 레코드 참조 정보.
 *
 * `IPaymentSource` 는 {@link IPaymentHistory 결제 내역} 및
 * {@link IPaymentResrvation 간편 결제 수단}의 원천이 되는 레코드의 참조 정보를 형상화한
 * 자료구조 인터페이이다. 만일 대상이 {@link IPaymentHistory 결제 내역}이라면 결제의
 * 근원이 되는 주문에 대한 참조 정보를, 대상이 {@link IPaymentResrvation 간편 결제 수단}
 * 이라면 이를 기록한 귀사 서비스의 참조 정보를 기입하면 된다.
 *
 * @author Samchon
 */
export interface IPaymentSource {
    /**
     * DB 스키마 이름
     */
    schema: string;

    /**
     * DB 테이블 명
     */
    table: string;

    /**
     * 참조 레코드의 PK
     */
    id: string & tags.Format<"uuid">;
}
export namespace IPaymentSource {
    /**
     * 접근자 정보.
     *
     * `IPaymentSource.IAccessor` 는 {@link IPaymentHistory 결제 내역} 내지
     * {@link IPaymentReservation 간편 결제 수단 정보}를 조회할 때, 그것의 고유 식별자
     * ID 가 아닌 원천 레코드 식별자 정보 {@link IPaymentSource} 를 통하여 조회할 때
     * 사용하는 접근자 정보이다.
     *
     * 다만 `payments-server` 의 모든 개별 레코드는 이를 조회할 시 비밀번호가 필요하기에,
     * {@link IPaymentSource} 의 속성들에 비밀번호가 하나 더 추가되었을 뿐이다.
     */
    export interface IAccessor extends IPaymentSource, IPassword {}

    /**
     * 비밀번호 입력 정보.
     */
    export interface IPassword {
        /**
         * 레코드 조회를 위한 비밀번호 입력.
         */
        password: string;
    }
}
