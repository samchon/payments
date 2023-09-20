import nest from "@modules/nestjs";
import core from "@nestia/core";

import { ISystem } from "../../api/structures/monitors/ISystem";
import { SystemProvider } from "../../providers/monitors/SystemProvider";

@nest.Controller("monitors/system")
export class SystemController {
    @core.EncryptedRoute.Get()
    public async get(): Promise<ISystem> {
        return {
            uid: SystemProvider.uid,
            arguments: process.argv,
            package: await SystemProvider.package(),
            commit: await SystemProvider.commit(),
            created_at: SystemProvider.created_at.toString(),
        };
    }
}
