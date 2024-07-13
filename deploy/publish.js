const cp = require("child_process");
const fs = require("fs");
const path = require("path");

const PACKAGES = [
  {
    location: "fake-iamport-server",
    name: "fake-iamport-server",
    api: "iamport-server-api",
  },
  {
    location: "fake-toss-payments-server", 
    name: "fake-toss-payments-server",
    api: "toss-payments-server-api",
  },
  {
    location: "payment-backend",
    name: "@samchon/payment-backend",
    api: "@samchon/payment-api",
  },
];

const execute =
  (cwd, stdio = "ignore") =>
  (command) => {
    console.log(command);
    cp.execSync(command, { cwd, stdio });
  };

const deploy = (tag) => (version) => (pack) => {
  console.log("-----------------------------------------");
  console.log(pack.location.toUpperCase());
  console.log("-----------------------------------------");

  // CHANGE PACKAGE.JSON INFO
  const location = `${__dirname}/../packages/${pack.location}`;
  const info = JSON.parse(
    fs.readFileSync(`${location}/package.json`, "utf8"),
  );
  info.version = version;

  for (const record of [info.dependencies ?? {}, info.devDependencies ?? {}])
    for (const key of Object.keys(record)) {
      const backend = PACKAGES.find(p => p.name === key);
      const api = PACKAGES.find(p => p.api === key);
      if (backend !== undefined) {
        if (tag === "tgz" && fs.existsSync(`${location}/node_modules/${key}`))
          execute(location)(`npm uninstall ${key}`);
        record[key] =
          tag === "tgz"
            ? path.resolve(`${__dirname}/../packages/${backend.location}/${key}-${version}.tgz`)
            : `^${version}`;
      }
      else if (api !== undefined) {
        if (tag === "tgz" && fs.existsSync(`${location}/node_modules/${key}`))
          execute(location)(`npm uninstall ${key}`);
        record[key] =
          tag === "tgz"
            ? path.resolve(`${__dirname}/../packages/${api.location}/packages/api/${key}-${version}.tgz`)
            : `^${version}`;
      }
    }

  // SETUP UPDATED DEPENDENCIES
  fs.writeFileSync(
    `${location}/package.json`, 
    JSON.stringify(info, null, 2), 
    "utf8",
  );
  execute(location)(`npm install`);
  execute(location)(`npm run build`);

  // RUN TEST PROGRAM
  if (pack.name === "@samchon/payment-backend") {
    execute(location)(`npm run schema`);
    execute(location, "inherit")(`npm run test -- --reset true`);
  } else if (fs.existsSync(`${location}/test`))
    execute(location, "inherit")(`npm run test`);

  // PUBLISH BACKEND
  if (tag === "tgz") execute(location)(`npm pack`);
  else execute(location)(`npm publish --tag ${tag} --access public`);

  // PUBLISH API
  const apiInfo = JSON.parse(
    fs.readFileSync(
      `${location}/packages/api/package.json`,
      "utf8",
    ),
  );
  apiInfo.version = version;
  if (pack.api === "@samchon/payment-api") {
    apiInfo.dependencies["iamport-server-api"] = tag === "tgz"
      ? path.resolve(
        `${__dirname}/../packages/fake-iamport-server/packages/api/iamport-server-api-${version}.tgz`
      )
      : `^${version}`;
    apiInfo.dependencies["toss-payments-server-api"] = tag === "tgz"
      ? path.resolve(
        `${__dirname}/../packages/fake-toss-payments-server/packages/api/toss-payments-server-api-${version}.tgz`
      )
      : `^${version}`;
  }
  fs.writeFileSync(
    `${location}/packages/api/package.json`,
    JSON.stringify(apiInfo, null, 2),
    "utf8",
  );
  execute(location)("npm run build:api");
  execute(location)("npm run build:swagger");
  cp.execSync(
    tag === "tgz" 
      ? "npm pack" 
      : `npm publish --tag ${tag} --access public`, 
    {
      stdio: "ignore",
      cwd: `${location}/packages/api`
    },
  );
  console.log("");
};

const publish = (tag) => {
  // GET VERSION
  const version = (() => {
    const content = fs.readFileSync(`${__dirname}/../package.json`, "utf8");
    const info = JSON.parse(content);
    return info.version;
  })();

  // VALIDATE TAG
  const dev = version.includes("-dev.") === true;
  if (tag === "next" && dev === false)
    throw new Error(`${tag} tag can only be used for dev versions.`);
  else if (tag === "latest" && dev === true)
    throw new Error(`latest tag can only be used for non-dev versions.`);

  // DO DEPLOY
  for (const pack of PACKAGES)
    deploy(tag)(version)(pack);
};

module.exports = { publish };
