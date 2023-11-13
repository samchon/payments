import fs from "fs";
import git from "git-last-commit";
import { Singleton } from "tstl/thread/Singleton";
import { v4 } from "uuid";

import { ISystem } from "../../api/structures/monitors/ISystem";
import { DateUtil } from "../../utils/DateUtil";

export class SystemProvider {
  public static readonly uid: string = v4();
  public static readonly created_at: Date = new Date();

  public static package(): Promise<ISystem.IPackage> {
    return package_.get();
  }

  public static commit(): Promise<ISystem.ICommit> {
    return commit_.get();
  }
}

// LOAD COMMITS & PACKAGES
const commit_: Singleton<Promise<ISystem.ICommit>> = new Singleton(
  () =>
    new Promise((resolve, reject) => {
      git.getLastCommit((err, commit) => {
        if (err) reject(err);
        else
          resolve({
            ...commit,
            authored_at: DateUtil.to_string(
              new Date(Number(commit.authoredOn) * 1000),
              true,
            ),
            commited_at: DateUtil.to_string(
              new Date(Number(commit.committedOn) * 1000),
              true,
            ),
          });
      });
    }),
);
const package_: Singleton<Promise<ISystem.IPackage>> = new Singleton(
  async () => {
    const content: string = await fs.promises.readFile(
      `${__dirname}/../../../../package.json`,
      "utf8",
    );
    return JSON.parse(content);
  },
);

commit_.get().catch(() => {});
package_.get().catch(() => {});
