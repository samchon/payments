import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { ISystem } from "../../api/structures/monitors/ISystem";
import { SystemProvider } from "../../providers/monitors/SystemProvider";

@Controller("monitors/system")
export class MonitorSystemController {
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
