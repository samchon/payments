import { SharedLock } from "tstl/thread/SharedLock";
import { SharedMutex } from "tstl/thread/SharedMutex";
import { UniqueLock } from "tstl/thread/UniqueLock";

import { IConnection } from "./IConnection";
import { users } from "./functional";
import { IIamportResponse } from "./structures/IIamportResponse";
import { IIamportUser } from "./structures/IIamportUser";

/**
 * 아임포트 커넥터.
 *
 * 아임포트가 발급해주는 유저 인증 토큰에는, 유효 시간 {@link IIamportUser.expired_at} 이
 * 존재하여, 해당 시간을 초과하거든 기 발급 토큰이 만료되어 더 이상 쓸 수 없게 된다. 때문에
 * 아임포트 API 를 호출할 때마다, 늘 토큰의 만료 시간을 신경 써줘야해서 매우 번거롭다.
 *
 * `IamportConnector` 는 이러한 번거로움을 없애기 위하여, 아임포트의 API 를 호출하기 위하여
 * {@link IConnection} 정보하기 위한 {@link IamportConnector.connect} 메서드를 호출할 때마다,
 * 아임포트 유저 인증 토큰의 만료 시간의 도래 여부를 계산하여 자동으로 갱신해주는 클래스이다.
 *
 * 따라서 아임포트 유저 토큰 고유의 시간 제한에 구애받지 않고, 아임포트의 API 들을 편하게 호출하고
 * 싶다면, 현재 `IamportConnector` 의 적극적인 사용을 권하는 바이다.
 *
 * @author Samchon
 */
export class IamportConnector {
    private readonly mutex_: SharedMutex;
    private token_: IIamportUser | null;

    /**
     * Initializer Constructor
     *
     * @param host 아임포트 서버의 host 주소
     * @param accessor 아임포트에서 발급해 준 API 및 secret 키
     * @param surplus 만료 일시로부터의 여분 시간, 기본값은 15,000 ms
     */
    public constructor(
        public readonly host: string,
        public readonly accessor: IIamportUser.IAccessor,
        public readonly surplus: number = 15_000,
    ) {
        this.mutex_ = new SharedMutex();
        this.token_ = null;
    }

    /**
     * 커넥션 정보 구성하기.
     *
     * 아임포트 API 를 호출하기 위한 {@link IConnection} 정보를 구성하여 리턴한다. 이 커넥션
     * 정보에는 아임포트의 유저 인증 토큰이 함께하는데, 만일 해당 유저 인증 토큰의 만료 일시가
     * 도래했다면, 이를 새로운 것으로 자동 갱신해준다.
     *
     * @returns 커넥션 정보 with 인증 토큰
     */
    public async get(): Promise<IConnection> {
        return {
            host: this.host,
            headers: {
                Authorization: await this.getToken(),
            },
        };
    }

    private async getToken(): Promise<string> {
        if (
            this.token_ === null ||
            Date.now() >= this.token_.expired_at * 1000 - this.surplus
        ) {
            const locked: boolean = await UniqueLock.try_lock(
                this.mutex_,
                async () => {
                    const output: IIamportResponse<IIamportUser> =
                        await users.getToken(
                            { host: this.host },
                            this.accessor,
                        );
                    this.token_ = output.response;
                },
            );
            if (locked === false) await SharedLock.lock(this.mutex_, () => {});
        }
        return this.token_!.access_token;
    }
}
