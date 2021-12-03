import atob from "atob";
import express from "express";
import * as nest from "@nestjs/common";

import { TossFakeConfiguration } from "../FakeTossConfiguration";

export namespace FakeTossUserAuth
{
    export function authorize(request: express.Request): void
    {
        let token: string | undefined = request.headers.authorization;
        if (token === undefined)
            throw new nest.ForbiddenException("No authorization token exists.");
        else if (token.indexOf("Basic ") !== 0)
            throw new nest.ForbiddenException("Invalid authorization token.");

        token = token.substr("Basic ".length);
        token = atob(token);
        
        if (TossFakeConfiguration.authorize(token) === false)
            throw new nest.ForbiddenException("Wrong authorization token.");
    }
}