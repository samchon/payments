import {
  ExecutionContext,
  ForbiddenException,
  createParamDecorator,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { IIamportUser } from "iamport-server-api/lib/structures/IIamportUser";
import { Singleton } from "tstl";
import { v4 } from "uuid";

import { FakeIamportConfiguration } from "../FakeIamportConfiguration";
import { FakeIamportStorage } from "../providers/FakeIamportStorage";

export function FakeIamportUserAuth() {
  return singleton.get()();
}
export namespace FakeIamportUserAuth {
  export function issue(accessor: IIamportUser.IAccessor): IIamportUser {
    if (FakeIamportConfiguration.authorize(accessor) === false)
      throw new ForbiddenException("Wrong authorization key values.");

    const user: IIamportUser = {
      now: Date.now() / 1_000,
      expired_at:
        (Date.now() + FakeIamportConfiguration.USER_EXPIRATION_TIME) / 1_000,
      access_token: v4(),
    };
    FakeIamportStorage.users.set(user.access_token, user);

    return user;
  }

  export function authorize(request: FastifyRequest): IIamportUser {
    const token: string | undefined = request.headers.authorization;
    if (token === undefined)
      throw new ForbiddenException("No authorization token exists.");

    const user: IIamportUser = FakeIamportStorage.users.get(token);
    if (new Date(user.expired_at * 1_000).getTime() > Date.now())
      throw new ForbiddenException("The token has been expired.");

    return user;
  }
}

const singleton = new Singleton(() =>
  createParamDecorator(async (_0: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return FakeIamportUserAuth.authorize(request);
  }),
);
