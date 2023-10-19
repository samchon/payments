import * as nest from "@nestjs/common";
import atob from "atob";
import * as fastify from "fastify";

import { FakeTossConfiguration } from "../FakeTossConfiguration";

export namespace FakeTossUserAuth {
    export function authorize(request: fastify.FastifyRequest): void {
        let token: string | undefined = request.headers.authorization;
        if (token === undefined)
            throw new nest.ForbiddenException("No authorization token exists.");
        else if (token.indexOf("Basic ") !== 0)
            throw new nest.ForbiddenException("Invalid authorization token.");

        token = token.substr("Basic ".length);
        token = atob(token);

        if (
            FakeTossConfiguration.authorize(
                token.substr(0, token.length - 1),
            ) === false
        )
            throw new nest.ForbiddenException("Wrong authorization token.");
    }
}
