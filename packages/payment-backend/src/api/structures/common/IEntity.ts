/**
 * 공통 엔티티.
 *
 * 통상적으로 UUID 타입의 PK 값을 가지는 엔티티 레코드들에 대한 추상 정의.
 *
 * @author Samchon
 */
export interface IEntity {
    /**
     * Primary Key
     *
     * @format uuid
     */
    id: string;
}
