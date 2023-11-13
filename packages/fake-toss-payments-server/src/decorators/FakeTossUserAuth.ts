import {
  ExecutionContext,
  ForbiddenException,
  createParamDecorator,
} from "@nestjs/common";
import atob from "atob";
import { FastifyRequest } from "fastify";
import { Singleton } from "tstl";

import { FakeTossConfiguration } from "../FakeTossConfiguration";

export function FakeTossUserAuth() {
  return singleton.get()();
}
export namespace FakeTossUserAuth {
  export function authorize(request: FastifyRequest): void {
    let token: string | undefined = request.headers.authorization;
    if (token === undefined)
      throw new ForbiddenException("No authorization token exists.");
    else if (token.indexOf("Basic ") !== 0)
      throw new ForbiddenException("Invalid authorization token.");

    token = token.substring("Basic ".length);
    token = atob(token);
    if (
      FakeTossConfiguration.authorize(token.substring(0, token.length - 1)) ===
      false
    )
      throw new ForbiddenException("Wrong authorization token.");
  }
}

const singleton = new Singleton(() =>
  createParamDecorator(async (_0: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return FakeTossUserAuth.authorize(request);
  }),
);
