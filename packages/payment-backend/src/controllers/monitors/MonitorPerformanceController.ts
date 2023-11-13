import core from "@nestia/core";
import { Controller } from "@nestjs/common";

import { IPerformance } from "../../api/structures/monitors/IPerformance";

@Controller("monitors/performance")
export class MonitorPerformanceController {
  @core.EncryptedRoute.Get()
  public async get(): Promise<IPerformance> {
    return {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      resource: process.resourceUsage(),
    };
  }
}
