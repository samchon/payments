import * as nest from "@nestjs/common";
import * as fastify from "fastify";
import { IIamportUser } from "iamport-server-api/lib/structures/IIamportUser";
import { v4 } from "uuid";

import { FakeIamportConfiguration } from "../FakeIamportConfiguration";
import { FakeIamportStorage } from "./FakeIamportStorage";

export namespace FakeIamportUserAuth {
    export function issue(accessor: IIamportUser.IAccessor): IIamportUser {
        if (FakeIamportConfiguration.authorize(accessor) === false)
            throw new nest.ForbiddenException(
                "Wrong authorization key values.",
            );

        const user: IIamportUser = {
            now: Date.now() / 1_000,
            expired_at:
                (Date.now() + FakeIamportConfiguration.USER_EXPIRATION_TIME) /
                1_000,
            access_token: v4(),
        };
        FakeIamportStorage.users.set(user.access_token, user);

        return user;
    }

    export function authorize(request: fastify.FastifyRequest): void {
        const token: string | undefined = request.headers.authorization;
        if (token === undefined)
            throw new nest.ForbiddenException("No authorization token exists.");

        const user: IIamportUser = FakeIamportStorage.users.get(token);
        if (new Date(user.expired_at * 1_000).getTime() > Date.now())
            throw new nest.ForbiddenException("The token has been expired.");
    }
}
