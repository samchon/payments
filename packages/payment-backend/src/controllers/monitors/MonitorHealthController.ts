import { Controller, Get } from "@nestjs/common";

@Controller("monitors/health")
export class MonitorHealthController {
  @Get()
  public get(): void {}
}
