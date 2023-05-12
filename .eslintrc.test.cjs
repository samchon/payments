const options = require("./.eslintrc.cjs");
options.parserOptions.project = "test/tsconfig.json";
options.overrides[0].files = ["test/**/*.ts"];

module.exports = options;
