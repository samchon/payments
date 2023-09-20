import { TestValidator } from "@nestia/e2e";
import imp from "iamport-server-api";
import { IIamportCertification } from "iamport-server-api/lib/structures/IIamportCertification";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import typia from "typia";

export async function test_fake_certification(
    connector: imp.IamportConnector,
): Promise<void> {
    /**
     * 본인인증 요청 시뮬레이션.
     *
     * 아임포트가 제공하는 본인인증 팝업창을 이용, 휴대폰 번호를 통한 본인인증을 진행한다.
     */
    const accessor: IIamportResponse<IIamportCertification.IAccessor> =
        await imp.functional.certifications.otp.request(await connector.get(), {
            name: "남정호",
            phone: "01011112222",
            birth: "19880311",
            gender_digit: "1",
            carrier: "LGT",
        });
    typia.assert(accessor);

    /**
     * 본인인증 상세 레코드 조회.
     *
     * 고객의 휴대폰 번호로 본인인증을 위한 OTP 번호가 문자로 전송되었지만, 아직 고객은
     * 이를 아임포트 본인인증 창의 OTP 입력 폼에 기재하지 않았다. 이처럼 본인인증이
     * 완결되지 않은 건에 대해서도, 아임포트는 본인인증 내역을 조회할 수 있다.
     *
     * 하지만 이 경우 {@link IIamportCertification.certified} 값이 `false` 로
     * 명시되기에, 이를 검사하면, 해당 본인인증 건이 완결되지 않았음을 알 수 있다.
     */
    const uncertified: IIamportResponse<IIamportCertification> =
        await imp.functional.certifications.at(
            await connector.get(),
            accessor.response.imp_uid,
        );
    typia.assert(uncertified);
    TestValidator.equals("not cerified")(uncertified.response.certified)(false);

    /**
     * 본인인증 OTP 코드 입력 시뮬레이션.
     *
     * 고객이 아임포트 본인인증 창에 입력한 OTP 코드가 정확하다면, 해당 본인인증 건은
     * 완결되어 {@link IIamportCertification.certified} 값이 `true` 로 변한다. 이는
     * {@link functional.certifications.at} 메서드를 통하여 해당 건을 재 조회하여도
     * 동일한 바이다.
     */
    const confirmed: IIamportResponse<IIamportCertification> =
        await imp.functional.certifications.otp.confirm(
            await connector.get(),
            accessor.response.imp_uid,
            {
                otp: uncertified.response.__otp!,
            },
        );
    typia.assert(confirmed);
    TestValidator.equals("cerified")(confirmed.response.certified)(true);
}
