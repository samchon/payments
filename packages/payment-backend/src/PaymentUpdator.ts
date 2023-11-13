import { MutexAcceptor, MutexConnector, MutexServer } from "mutex-server";
import { HashSet } from "tstl/container/HashSet";

import { PaymentConfiguration } from "./PaymentConfiguration";
import { Terminal } from "./utils/Terminal";

/**
 * 업데이트 리스너.
 *
 * @author Samchon
 */
export namespace PaymentUpdator {
  export interface IController {
    update(): Promise<void>;
  }

  /**
   * 마스터 인스턴스에서의 업데이트 리스터 실행.
   *
   * @returns 뮤텍스 서버 인스턴스
   */
  export async function master(): Promise<
    MutexServer<string, IController | null>
  > {
    // PREPARE ASSETS
    const server: MutexServer<string, IController | null> = new MutexServer();
    const clientSet: HashSet<MutexAcceptor<string, any>> = new HashSet();
    const provider: IController = {
      update: async () => {
        const clientList: MutexAcceptor<string, any>[] = [...clientSet];
        const tasks: Promise<void>[] = clientList.map(async (client) => {
          try {
            await client.getDriver<IController>().update();
          } catch {}
        });
        await Promise.all(tasks);
      },
    };

    // OPEN SERVER
    await server.open(PaymentConfiguration.UPDATOR_PORT(), async (acceptor) => {
      if (acceptor.header !== PaymentConfiguration.SYSTEM_PASSWORD()) {
        await acceptor.reject();
        return;
      } else if (acceptor.path === "/slave") {
        await acceptor.accept(null);

        clientSet.insert(acceptor);
        acceptor
          .join()
          .then(() => clientSet.erase(acceptor))
          .catch(() => {});
      } else if (acceptor.path === "/api") await acceptor.accept(null);
      else if (acceptor.path === "/update") await acceptor.accept(provider);
    });
    return server;
  }

  /**
   * 슬레이브 인스턴스에서의 업데이트 리스터 실행.
   *
   * @param 업데이트 리스너 마스터 서버의 host 주소, 생략시 기본값 사용
   * @returns 뮤텍스 커넥터 인스턴스
   */
  export async function slave(
    host?: string,
  ): Promise<MutexConnector<string, IController>> {
    const connector: MutexConnector<string, IController> = new MutexConnector(
      PaymentConfiguration.SYSTEM_PASSWORD(),
      Controller,
    );
    await connector.connect(
      `ws://${
        host ?? PaymentConfiguration.MASTER_IP()
      }:${PaymentConfiguration.UPDATOR_PORT()}/slave`,
    );
    return connector;
  }

  /**
   * @internal
   */
  namespace Controller {
    export async function update(): Promise<void> {
      // REFRESH REPOSITORY
      await Terminal.execute("git pull");
      await Terminal.execute("npm install");
      await Terminal.execute("npm run build");

      // RELOAD PM2
      await Terminal.execute("npm run start:reload");
    }
  }
}
