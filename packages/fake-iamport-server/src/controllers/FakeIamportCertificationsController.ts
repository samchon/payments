import core from "@nestia/core";
import {
  Controller,
  ForbiddenException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { IIamportCertification } from "iamport-server-api/lib/structures/IIamportCertification";
import { IIamportResponse } from "iamport-server-api/lib/structures/IIamportResponse";
import { IIamportUser } from "iamport-server-api/lib/structures/IIamportUser";
import { randint } from "tstl";
import { v4 } from "uuid";

import { FakeIamportUserAuth } from "../decorators/FakeIamportUserAuth";
import { FakeIamportResponseProvider } from "../providers/FakeIamportResponseProvider";
import { FakeIamportStorage } from "../providers/FakeIamportStorage";

@Controller("certifications")
export class FakeIamportCertificationsController {
  /**
   * 본인인증 정보 열람하기.
   *
   * `certiciations.at` 은 본인인증 정보를 열람할 때 사용하는 API 함수이다.
   *
   * 다만 이 API 함수를 통하여 열람한 본인인증 정보 {@link IIamportCertification} 이
   * 곧 OTP 인증까지 마쳐 본인인증을 모두 마친 레코드라는 보장은 없다. 본인인증의 완결
   * 여부는 오직, {@link IIamportCertification.certified} 값을 직접 검사해봐야만 알
   * 수 있기 때문이다.
   *
   * @param imp_uid 대상 본인인증 정보의 {@link IIamportCertification.imp_uid}
   * @returns 본인인증 정보
   *
   * @security bearer
   * @author Samchon
   */
  @core.TypedRoute.Get(":imp_uid")
  public at(
    @FakeIamportUserAuth() _user: IIamportUser.IAccessor,
    @core.TypedParam("imp_uid") imp_uid: string,
  ): IIamportResponse<IIamportCertification> {
    const certification = FakeIamportStorage.certifications.get(imp_uid);
    return FakeIamportResponseProvider.success(certification);
  }

  /**
   * 본인인증 요청하기.
   *
   * `certifications.otp.request` 는 아임포트 서버에 본인인증을 요청하는 API 함수이다.
   * 이 API 를 호출하면 본인인증 대상자의 핸드폰으로 OTP 문자가 전송되며, 본인인증
   * 대상자가 {@link certifications.otp.confirm} 을 통하여 이 OTP 번호를 정확히
   * 입력함으로써, 본인인증이 완결된다.
   *
   * 또한 본인인증 대상자가 자신의 핸드폰으로 전송된 OTP 문자를 입력하기 전에도,
   * 여전히해당 본인인증 내역은 {@link certifications.at} 함수를 통하여 조회할 수 있다.
   * 다만, 이 때 리턴되는 {@link IIamportCertification} 에서 인증의 완결 여부를
   * 지칭하는 {@link IIamportCertification.certified} 값은 `false` 이다.
   *
   * @param input 본인인증 요청 정보
   * @returns 진행 중인 본인인증의 식별자 정보
   *
   * @security bearer
   * @author Samchon
   */
  @core.TypedRoute.Post("otp/request")
  public request(
    @FakeIamportUserAuth() _user: IIamportUser.IAccessor,
    @core.TypedBody() input: IIamportCertification.IStore,
  ): IIamportResponse<IIamportCertification.IAccessor> {
    const birth: Date = new Date(
      `${input.birth.substr(0, 4)}-${input.birth.substr(
        4,
        2,
      )}-${input.birth.substr(6, 2)}`,
    );
    const certication: IIamportCertification = {
      imp_uid: v4(),
      merchant_uid: input.merchant_uid || null,

      name: input.name,
      gender: String(Number(input.gender_digit) % 2),
      birth: birth.getTime() / 1_000,
      birthday: input.birth,
      foreigner: false,
      phone: input.phone.split("-").join(""),
      carrier: input.carrier,

      certified: false,
      certified_at: 0,

      unique_key: v4(),
      unique_in_site: v4(),
      pg_tid: v4(),
      pg_provider: "some-provider",
      origin: "fake-iamport",

      __otp: randint(0, 9999).toString().padStart(4, "0"),
    };
    FakeIamportStorage.certifications.set(certication.imp_uid, certication);

    return FakeIamportResponseProvider.success({
      imp_uid: certication.imp_uid,
    });
  }

  /**
   * 본인인증 시 발급된 OTP 코드 입력하기.
   *
   * `certifications.otp.confirm` 는 {@link certifications.otp.request} 를 통하여
   * 발급된 본인인증 건에 대하여, 본인인증 대상자의 휴대폰으로 전송된 OTP 번호를
   * 검증하고, 입력한 OTP 번호가 맞거든 해당 본인인증 건을 승인하여 완료 처리해주는
   * API 함수이다.
   *
   * 이처럼 본인인증을 완료하거든, 해당 본인인증 건 {@link IIamportCertification} 의
   * {@link IIamportCertification.certified} 값이 비로소 `true` 로 변경되어,
   * 비로소 완결된다.
   *
   * @param imp_uid 대상 본인인증 정보의 {@link IIamportCertification.imp_uid}
   * @param input OTP 코드
   * @returns 인증 완료된 본인인증 정보
   *
   * @security bearer
   * @author Samchon
   */
  @core.TypedRoute.Post("otp/confirm/:imp_uid")
  public confirm(
    @FakeIamportUserAuth() _user: IIamportUser.IAccessor,
    @core.TypedParam("imp_uid") imp_uid: string,
    @core.TypedBody() input: IIamportCertification.IConfirm,
  ): IIamportResponse<IIamportCertification> {
    const certification = FakeIamportStorage.certifications.get(imp_uid);
    if (certification.certified === true)
      throw new UnprocessableEntityException("Already certified.");
    else if (certification.__otp !== input.otp)
      throw new ForbiddenException("Wrong OTP value.");

    certification.certified = true;
    certification.certified_at = Date.now() / 1_000;
    return FakeIamportResponseProvider.success(certification);
  }

  /**
   * 본인인증 정보 삭제하기.
   *
   * @param imp_uid 대상 본인인증 정보의 {@link IIamportCertification.imp_uid}
   * @returns 삭제된 본인인증 정보
   *
   * @security bearer
   * @author Samchon
   */
  @core.TypedRoute.Delete(":imp_uid")
  public erase(
    @FakeIamportUserAuth() _user: IIamportUser.IAccessor,
    @core.TypedParam("imp_uid") imp_uid: string,
  ): IIamportResponse<IIamportCertification> {
    const certification = FakeIamportStorage.certifications.get(imp_uid);
    FakeIamportStorage.certifications.erase(imp_uid);

    return FakeIamportResponseProvider.success(certification);
  }
}
