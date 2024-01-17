const cp = require("child_process");
const fs = require("fs");
const path = require("path");

const packages = fs.readdirSync(`${__dirname}/../packages`);

const execute =
  (cwd, stdio = "ignore") =>
  (command) => {
    console.log(command);
    cp.execSync(command, { cwd, stdio });
  };

const deploy = (tag) => (version) => (name) => {
  console.log("-----------------------------------------");
  console.log(name.toUpperCase());
  console.log("-----------------------------------------");

  // CHANGE PACKAGE.JSON INFO
  const directory = `${__dirname}/../packages/${name}`;
  const file = `${directory}/package.json`;
  const info = JSON.parse(fs.readFileSync(file, "utf8"));
  info.version = version;

  for (const record of [info.dependencies ?? {}, info.devDependencies ?? {}])
    for (const key of Object.keys(record))
      if (packages.includes(key.replace("@samchon/", ""))) {
        if (tag === "tgz" && fs.existsSync(`${directory}/node_modules/${key}`))
          execute(directory)(`npm uninstall ${key}`);
        record[key] =
          tag === "tgz"
            ? path.resolve(
                `${__dirname}/../packages/${key.replace(
                  "@samchon/",
                  "",
                )}/${key}-${version}.tgz`,
              )
            : `^${version}`;
      }

  // SETUP UPDATED DEPENDENCIES
  fs.writeFileSync(file, JSON.stringify(info, null, 2), "utf8");
  execute(directory)(`npm install`);
  execute(directory)(`npm run build`);

  // RUN TEST PROGRAM
  if (name === "payment-backend") {
    execute(directory)(`npm run schema`);
    execute(directory, "inherit")(`npm run test -- --reset true`);
  } else if (fs.existsSync(`${directory}/test`))
    execute(directory, "inherit")(`npm run test`);

  // BUILD SWAGGER FILE
  if (name.includes("api") === false)
    execute(directory)(`npm run build:swagger`);

  // PUBLISH (OR PACK)
  if (tag === "tgz") execute(directory)(`npm pack`);
  else execute(directory)(`npm publish --tag ${tag} --access public`);
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
  for (const pack of [
    "fake-iamport-server",
    "fake-toss-payments-server",
    "iamport-server-api",
    "toss-payments-server-api",
    "payment-backend",
    "payment-api",
  ])
    deploy(tag)(version)(pack);
};

module.exports = { publish };
